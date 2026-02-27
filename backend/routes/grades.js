const express = require("express");
const router = express.Router();
const GradeSheet = require("../models/GradeSheet");

// ==================== FACULTY ENDPOINTS ====================

// GET all grade sheets for a faculty
router.get("/faculty/:facultyId", async (req, res) => {
    try {
        const { facultyId } = req.params;
        const gradeSheets = await GradeSheet.find({ facultyId }).sort({
            createdAt: -1,
        });

        // Return with student count
        const sheetsWithCount = gradeSheets.map((sheet) => ({
            ...sheet.toObject(),
            studentCount: sheet.studentGrades.length,
        }));

        res.json(sheetsWithCount);
    } catch (error) {
        console.error("Error fetching grade sheets:", error);
        res.status(500).json({ error: "Failed to fetch grade sheets" });
    }
});

// GET single grade sheet with all student grades
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const gradeSheet = await GradeSheet.findById(id);

        if (!gradeSheet) {
            return res.status(404).json({ error: "Grade sheet not found" });
        }

        res.json(gradeSheet);
    } catch (error) {
        console.error("Error fetching grade sheet:", error);
        res.status(500).json({ error: "Failed to fetch grade sheet" });
    }
});

// POST create new grade sheet
router.post("/", async (req, res) => {
    try {
        const {
            subjectCode,
            subjectName,
            credits,
            year,
            branch,
            section,
            semester,
            academicYear,
            degree,
            facultyId,
            facultyName,
            students, // Array of { studentId, studentName }
        } = req.body;

        // Initialize student grades from student list
        const studentGrades = students.map((s) => ({
            studentId: s.studentId,
            studentName: s.studentName || "",
            mid1: null,
            assignment1: null,
            mid2: null,
            assignment2: null,
            project: null,
            external: null,
        }));

        const gradeSheet = new GradeSheet({
            subjectCode,
            subjectName,
            credits: credits || 3,
            year,
            branch,
            section,
            semester,
            academicYear,
            degree: degree || "Major",
            facultyId,
            facultyName,
            studentGrades,
            status: "Draft",
        });

        await gradeSheet.save();
        res.status(201).json(gradeSheet);
    } catch (error) {
        console.error("Error creating grade sheet:", error.message);
        res.status(500).json({ error: error.message || "Failed to create grade sheet" });
    }
});

// PUT update student grades (faculty enters marks)
router.put("/:id/grades", async (req, res) => {
    try {
        const { id } = req.params;
        const { studentGrades } = req.body; // Array of student grade updates

        const gradeSheet = await GradeSheet.findById(id);
        if (!gradeSheet) {
            return res.status(404).json({ error: "Grade sheet not found" });
        }

        // Update each student's grades
        studentGrades.forEach((update) => {
            const student = gradeSheet.studentGrades.find(
                (s) => s.studentId === update.studentId
            );
            if (student) {
                if (update.mid1 !== undefined) student.mid1 = update.mid1;
                if (update.assignment1 !== undefined)
                    student.assignment1 = update.assignment1;
                if (update.mid2 !== undefined) student.mid2 = update.mid2;
                if (update.assignment2 !== undefined)
                    student.assignment2 = update.assignment2;
                if (update.project !== undefined) student.project = update.project;
            }
        });

        await gradeSheet.save();
        res.json(gradeSheet);
    } catch (error) {
        console.error("Error updating grades:", error);
        res.status(500).json({ error: "Failed to update grades" });
    }
});

// PUT submit grade sheet to admin
router.put("/:id/submit", async (req, res) => {
    try {
        const { id } = req.params;

        const gradeSheet = await GradeSheet.findByIdAndUpdate(
            id,
            { status: "Submitted", updatedAt: new Date() },
            { new: true }
        );

        if (!gradeSheet) {
            return res.status(404).json({ error: "Grade sheet not found" });
        }

        res.json({ message: "Grade sheet submitted to admin", gradeSheet });
    } catch (error) {
        console.error("Error submitting grade sheet:", error);
        res.status(500).json({ error: "Failed to submit grade sheet" });
    }
});

// DELETE grade sheet
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const gradeSheet = await GradeSheet.findByIdAndDelete(id);

        if (!gradeSheet) {
            return res.status(404).json({ error: "Grade sheet not found" });
        }

        res.json({ message: "Grade sheet deleted successfully" });
    } catch (error) {
        console.error("Error deleting grade sheet:", error);
        res.status(500).json({ error: "Failed to delete grade sheet" });
    }
});

// ==================== ADMIN ENDPOINTS ====================

// GET all submitted grade sheets (for admin to add external)
router.get("/admin/submitted", async (req, res) => {
    try {
        const gradeSheets = await GradeSheet.find({
            status: { $in: ["Submitted", "Published"] },
        }).sort({ updatedAt: -1 });

        const sheetsWithCount = gradeSheets.map((sheet) => ({
            ...sheet.toObject(),
            studentCount: sheet.studentGrades.length,
        }));

        res.json(sheetsWithCount);
    } catch (error) {
        console.error("Error fetching submitted grade sheets:", error);
        res.status(500).json({ error: "Failed to fetch grade sheets" });
    }
});

// PUT add external marks (admin)
router.put("/:id/external", async (req, res) => {
    try {
        const { id } = req.params;
        const { studentGrades } = req.body; // Array of { studentId, external }

        const gradeSheet = await GradeSheet.findById(id);
        if (!gradeSheet) {
            return res.status(404).json({ error: "Grade sheet not found" });
        }

        // Update external marks
        studentGrades.forEach((update) => {
            const student = gradeSheet.studentGrades.find(
                (s) => s.studentId === update.studentId
            );
            if (student && update.external !== undefined) {
                student.external = update.external;
            }
        });

        await gradeSheet.save();
        res.json(gradeSheet);
    } catch (error) {
        console.error("Error updating external marks:", error);
        res.status(500).json({ error: "Failed to update external marks" });
    }
});

// PUT publish results (admin)
router.put("/:id/publish", async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId } = req.body;

        const gradeSheet = await GradeSheet.findByIdAndUpdate(
            id,
            {
                status: "Published",
                publishedAt: new Date(),
                publishedBy: adminId,
                updatedAt: new Date(),
            },
            { new: true }
        );

        if (!gradeSheet) {
            return res.status(404).json({ error: "Grade sheet not found" });
        }

        res.json({ message: "Results published successfully", gradeSheet });
    } catch (error) {
        console.error("Error publishing results:", error);
        res.status(500).json({ error: "Failed to publish results" });
    }
});

// ==================== STUDENT ENDPOINTS ====================

// GET student's results (all subjects)
router.get("/student/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;

        // Find all published grade sheets that contain this student
        const gradeSheets = await GradeSheet.find({
            status: "Published",
            "studentGrades.studentId": studentId,
        });

        // Extract this student's grades from each sheet
        const results = gradeSheets.map((sheet) => {
            const studentGrade = sheet.studentGrades.find(
                (s) => s.studentId === studentId
            );
            return {
                subjectCode: sheet.subjectCode,
                subjectName: sheet.subjectName,
                credits: sheet.credits,
                degree: sheet.degree || "Major",
                year: sheet.year,
                semester: sheet.semester,
                academicYear: sheet.academicYear,
                facultyName: sheet.facultyName,
                grades: studentGrade
                    ? {
                        mid1: studentGrade.mid1,
                        mid1Converted: studentGrade.mid1Converted,
                        assignment1: studentGrade.assignment1,
                        mid1Total: studentGrade.mid1Total,
                        mid2: studentGrade.mid2,
                        mid2Converted: studentGrade.mid2Converted,
                        assignment2: studentGrade.assignment2,
                        mid2Total: studentGrade.mid2Total,
                        project: studentGrade.project,
                        internalMarks: studentGrade.internalMarks,
                        external: studentGrade.external,
                        totalMarks: studentGrade.totalMarks,
                        grade: studentGrade.grade,
                        gradePoints: studentGrade.gradePoints,
                    }
                    : null,
                publishedAt: sheet.publishedAt,
            };
        });

        res.json(results);
    } catch (error) {
        console.error("Error fetching student results:", error);
        res.status(500).json({ error: "Failed to fetch results" });
    }
});

module.exports = router;
