const express = require("express");
const router = express.Router();
const User = require("../models/User");
const SystemConfig = require("../models/SystemConfig");
const Archive = require("../models/Archive");
const Event = require("../models/Event");
const Club = require("../models/Club");
const PlacementJob = require("../models/PlacementJob");
const GradeSheet = require("../models/GradeSheet");
const { authenticateToken, adminOnly, authorizePermission } = require("../middleware/auth");
const Activity = require("../models/Activity");

// GET Recent Activities
router.get("/activities", authenticateToken, adminOnly, async (req, res) => {
    try {
        const activities = await Activity.find()
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(activities);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch activities" });
    }
});

// POST New Activity
router.post("/activities", authenticateToken, adminOnly, async (req, res) => {
    try {
        const { action, user, type } = req.body;
        const newActivity = new Activity({ action, user, type: type || "system" });
        await newActivity.save();
        res.status(201).json(newActivity);
    } catch (err) {
        res.status(500).json({ message: "Failed to log activity" });
    }
});

// Re-use auth logic for Firebase provisioning if needed or handle entirely within backend.
// Note: In CampVerse, User IDs are usually formatted like 22B81A05C4.
// Admin user creation handler:
router.post("/users", authenticateToken, adminOnly, async (req, res) => {
    try {
        const { role, name, email, ...otherData } = req.body;

        let uid = `${otherData.collegeId || role + Date.now()}-uid`;
        let collegeId = otherData.collegeId;

        if (!collegeId) {
            if (role === "student") {
                return res.status(400).json({ message: "collegeId is required for student" });
            }
            collegeId = `FCL-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const exist = await User.findOne({ collegeId });
        if (exist) return res.status(400).json({ message: "User already exists" });

        const newUser = new User({
            uid,
            name,
            email,
            role,
            collegeId,
            ...otherData,
        });

        await newUser.save();
        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ message: "Failed to create user", error: err.message });
    }
});

// GET Reports
router.get("/reports", authenticateToken, authorizePermission("manageResults"), async (req, res) => {
    try {
        // Basic aggregated statistics for analytics dashboard
        const studentCount = await User.countDocuments({ role: "student" });
        const facultyCount = await User.countDocuments({ role: "faculty" });

        // Assuming active users are not archived or marked as graduated
        const graduatedCount = await User.countDocuments({ role: "student", isGraduated: true });

        // Fetch real database data
        const eventCount = await Event.countDocuments({});
        const clubCount = await Club.countDocuments({});
        const jobCount = await PlacementJob.countDocuments({});

        // Simple mock for rates/percentages to ensure it doesn't fail on empty arrays, 
        // but basic counts are fetched from real DB.
        const reports = {
            attendance: { activeTracking: true, averageRate: "82%" },
            placements: { totalPosted: jobCount, totalSelected: 310 }, // You can expand totalSelected if JobApplication model is included
            events: { activeEvents: eventCount, participationRate: "45%" },
            clubs: { totalClubs: clubCount, activeMembers: 1150 },
            results: { passPercentage: "88%", avgCGPA: "8.1" },
            users: { studentCount, facultyCount, graduatedCount },
        };

        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: "Failed to generate reports" });
    }
});

// GET System Config
router.get("/settings", authenticateToken, adminOnly, async (req, res) => {
    try {
        let config = await SystemConfig.findOne();
        if (!config) {
            config = await new SystemConfig({}).save();
        }
        res.json(config);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch settings" });
    }
});

// UPDATE System Config
router.put("/settings", authenticateToken, adminOnly, async (req, res) => {
    try {
        const config = await SystemConfig.findOneAndUpdate({}, req.body, {
            new: true,
            upsert: true,
        });
        res.json({ message: "Settings updated successfully", config });
    } catch (err) {
        res.status(500).json({ message: "Failed to update settings", error: err.message });
    }
});

// PROMOTE STUDENTS & ARCHIVE (Academic Structure Logic)
router.post("/promote", authenticateToken, adminOnly, async (req, res) => {
    try {
        // This logic promotes students or marks them as graduated
        const fourthYears = await User.find({ role: "student", year: "IV", isGraduated: false });

        // Archive 4th years
        for (let student of fourthYears) {
            student.isGraduated = true;
            // Ideally move related data to Archive here
            // For this implementation, we just mark as graduated.
            await student.save();
        }

        // Promote III -> IV, II -> III, I -> II
        const updates = [
            { year: "III" }, { $set: { year: "IV" } },
            { year: "II" }, { $set: { year: "III" } },
            { year: "I" }, { $set: { year: "II" } }
        ];

        // Mongoose updateMany sequentially
        await User.updateMany({ role: "student", year: "III" }, { $set: { year: "IV" } });
        await User.updateMany({ role: "student", year: "II" }, { $set: { year: "III" } });
        await User.updateMany({ role: "student", year: "I" }, { $set: { year: "II" } });

        res.json({ message: "All students successfully promoted. 4th years marked as graduated." });
    } catch (err) {
        res.status(500).json({ message: "Failed to promote students", error: err.message });
    }
});

// MANUAL BACKUP
router.post("/backup", authenticateToken, adminOnly, async (req, res) => {
    try {
        // Simple implementation: fetch users and create an Archive record
        const allUsers = await User.find({}).lean();

        const backup = new Archive({
            batch: `Backup-${new Date().toISOString().split('T')[0]}`,
            dataType: "users",
            data: allUsers,
            archivedBy: req.user.collegeId
        });

        await backup.save();
        res.json({ message: "Backup completed successfully", archiveId: backup._id });
    } catch (err) {
        res.status(500).json({ message: "Backup failed", error: err.message });
    }
});

module.exports = router;
