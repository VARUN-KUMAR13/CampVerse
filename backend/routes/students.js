const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const User = require("../models/User");

// GET /api/students/section/:year/:branch/:section - Fetch a whole section of students
router.get("/section/:year/:branch/:section", async (req, res) => {
    try {
        const { year, branch, section } = req.params;
        const targetSection = section.toUpperCase();
        console.log(`[Students API] Fetching section: Year ${year}, Branch ${branch}, Section ${targetSection}`);

        let students = [];

        // First add students from MongoDB
        const mongoUsers = await User.find({
            role: "student",
            year: { $regex: new RegExp(`^${year}$`, "i") },
            branch: { $regex: new RegExp(`^${branch}$`, "i") },
            section: { $regex: new RegExp(`^${targetSection}$`, "i") }
        });

        const mongoMapped = mongoUsers.map(u => ({
            rollNumber: u.collegeId,
            name: u.name !== u.collegeId ? u.name : 'Unknown',
            section: u.section,
            branch: u.branch,
            year: u.year
        }));

        students = [...mongoMapped];

        // Then look up in Firebase Realtime Database using Admin SDK
        if (admin.apps.length > 0) {
            const db = admin.database();

            try {
                // Try 'students' node first
                let snapshot = await db.ref("students").once("value");
                let allData = snapshot.val();

                // If not in 'students', try root node
                if (!allData || Object.keys(allData).length === 0) {
                    snapshot = await db.ref("/").once("value");
                    allData = snapshot.val();
                }

                if (allData) {
                    for (const key in allData) {
                        // Skip system paths
                        if (["attendance", "notifications", "schedules", "clubs", "exams", "jobs", "users", "students"].includes(key) || key.startsWith("section_")) continue;

                        const student = allData[key];
                        if (student && typeof student === "object") {
                            const rollNo = student["ROLL NO"] || student.rollNumber || student.collegeId;
                            if (!rollNo) continue;

                            let match = false;

                            if (targetSection === 'B') {
                                if (rollNo.startsWith('22B81A05') || rollNo.startsWith(`${year}B81A${branch}`)) {
                                    match = true;
                                }
                            } else {
                                const lastTwoChars = rollNo.slice(-2);
                                const firstCharOfLastTwo = lastTwoChars[0];
                                if (firstCharOfLastTwo === targetSection) {
                                    match = true;
                                }
                            }

                            if (match) {
                                // Check if we already have this student from Mongo
                                if (!students.some(s => s.rollNumber.toUpperCase() === rollNo.toUpperCase())) {
                                    const name = student["Name of the student"] || student.name || student.studentName || 'Unknown';
                                    students.push({
                                        rollNumber: rollNo.toUpperCase(),
                                        name: name,
                                        section: targetSection,
                                        branch: branch,
                                        year: year,
                                    });
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn("[Students API] Section Firebase search failed:", e.message);
            }
        }

        return res.json({ students: students.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber)) });

    } catch (error) {
        console.error("[Students API] Section Error:", error);
        res.status(500).json({ error: "Failed to fetch section data" });
    }
});

// GET /api/students/:rollNumber - Fetch student data from Firebase RTDB via Admin SDK
router.get("/:rollNumber", async (req, res) => {
    try {
        const rollNumber = req.params.rollNumber.toUpperCase();
        console.log(`[Students API] Looking up student: ${rollNumber}`);

        // Step 1: Check MongoDB first (fastest)
        const mongoUser = await User.findOne({ collegeId: rollNumber });
        if (mongoUser && mongoUser.name && mongoUser.name !== rollNumber && mongoUser.name !== `User ${rollNumber}`) {
            console.log(`[Students API] Found in MongoDB: ${mongoUser.name}`);
            return res.json({
                rollNumber,
                name: mongoUser.name,
                section: mongoUser.section || null,
                branch: mongoUser.branch || null,
                year: mongoUser.year || null,
                source: "mongodb",
            });
        }

        // Step 2: Look up in Firebase Realtime Database using Admin SDK
        if (admin.apps.length > 0) {
            const db = admin.database();

            // Try direct paths first
            const directPaths = [
                `students/${rollNumber}`,
                `users/${rollNumber}`,
            ];

            for (const path of directPaths) {
                try {
                    const snapshot = await db.ref(path).once("value");
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        const name = data.name || data.Name || data["Name of the student"] || data.studentName;
                        if (name) {
                            console.log(`[Students API] Found at ${path}: ${name}`);

                            // Update MongoDB with the name if it was a placeholder
                            if (mongoUser) {
                                mongoUser.name = name;
                                mongoUser.section = data.section || data.Section || data.SECTION || mongoUser.section;
                                await mongoUser.save();
                            }

                            return res.json({
                                rollNumber,
                                name,
                                section: data.section || data.Section || data.SECTION || null,
                                branch: data.branch || data.Branch || null,
                                year: data.year || data.Year || null,
                                source: "firebase",
                            });
                        }
                    }
                } catch (e) {
                    // Continue to next path
                }
            }

            // Try root-level search (students stored with numeric keys)
            try {
                const snapshot = await db.ref("/").once("value");
                if (snapshot.exists()) {
                    const allData = snapshot.val();
                    for (const key in allData) {
                        // Skip system paths
                        if (["attendance", "notifications", "schedules", "clubs", "exams", "jobs", "users", "students"].includes(key)) continue;

                        const student = allData[key];
                        if (student && typeof student === "object") {
                            const studentRoll = student["ROLL NO"] || student.rollNumber || student.collegeId || student["Roll No"];
                            if (studentRoll && studentRoll.toUpperCase() === rollNumber) {
                                const name = student["Name of the student"] || student.Name || student.name || student.studentName;
                                if (name) {
                                    console.log(`[Students API] Found at root/${key}: ${name}`);
                                    const section = student.Section || student.SECTION || student.section || null;

                                    // Update MongoDB
                                    if (mongoUser) {
                                        mongoUser.name = name;
                                        if (section) mongoUser.section = section;
                                        await mongoUser.save();
                                    }

                                    return res.json({
                                        rollNumber,
                                        name,
                                        section,
                                        branch: student.Branch || student.branch || null,
                                        year: student.Year || student.year || null,
                                        source: "firebase",
                                    });
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn("[Students API] Root search failed:", e.message);
            }
        } else {
            console.log("[Students API] Firebase Admin not initialized");
        }

        // Step 3: If still not found, return whatever we have from MongoDB
        if (mongoUser) {
            return res.json({
                rollNumber,
                name: mongoUser.name,
                section: mongoUser.section || null,
                branch: mongoUser.branch || null,
                year: mongoUser.year || null,
                source: "mongodb",
            });
        }

        // Not found anywhere
        return res.status(404).json({
            error: "Student not found",
            rollNumber,
        });
    } catch (error) {
        console.error("[Students API] Error:", error);
        res.status(500).json({ error: "Failed to fetch student data" });
    }
});

module.exports = router;
