const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");

// ==================== FACULTY ENDPOINTS ====================

// GET all assignments (for faculty)
router.get("/faculty/:facultyId", async (req, res) => {
    try {
        const { facultyId } = req.params;
        const assignments = await Assignment.find({ createdBy: facultyId })
            .select("-submissions.fileData") // Exclude file data for list view
            .sort({ createdAt: -1 });

        // Add submission count to each assignment
        const assignmentsWithCount = assignments.map((a) => ({
            ...a.toObject(),
            submissionCount: a.submissions.length,
        }));

        res.json(assignmentsWithCount);
    } catch (error) {
        console.error("Error fetching faculty assignments:", error);
        res.status(500).json({ error: "Failed to fetch assignments" });
    }
});

// GET all assignments (for all faculty to view)
router.get("/all", async (req, res) => {
    try {
        const assignments = await Assignment.find()
            .select("-submissions.fileData")
            .sort({ createdAt: -1 });

        const assignmentsWithCount = assignments.map((a) => ({
            ...a.toObject(),
            submissionCount: a.submissions.length,
        }));

        res.json(assignmentsWithCount);
    } catch (error) {
        console.error("Error fetching all assignments:", error);
        res.status(500).json({ error: "Failed to fetch assignments" });
    }
});

// POST create new assignment
router.post("/", async (req, res) => {
    try {
        const {
            title,
            description,
            course,
            courseCode,
            dueDate,
            createdBy,
            createdByName,
            section,
            branch,
            year,
            maxMarks,
        } = req.body;

        const assignment = new Assignment({
            title,
            description,
            course,
            courseCode,
            dueDate,
            createdBy,
            createdByName,
            section: section || "B",
            branch: branch || "CSE",
            year: year || "2022",
            maxMarks: maxMarks || 100,
            status: "Active",
        });

        await assignment.save();
        res.status(201).json(assignment);
    } catch (error) {
        console.error("Error creating assignment:", error);
        res.status(500).json({ error: "Failed to create assignment" });
    }
});

// PUT update assignment
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const assignment = await Assignment.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: new Date() },
            { new: true }
        );

        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        res.json(assignment);
    } catch (error) {
        console.error("Error updating assignment:", error);
        res.status(500).json({ error: "Failed to update assignment" });
    }
});

// DELETE assignment
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await Assignment.findByIdAndDelete(id);

        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        res.json({ message: "Assignment deleted successfully" });
    } catch (error) {
        console.error("Error deleting assignment:", error);
        res.status(500).json({ error: "Failed to delete assignment" });
    }
});

// GET submissions for an assignment (faculty view)
router.get("/:id/submissions", async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await Assignment.findById(id);

        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        // Return submissions without file data (just metadata)
        const submissionsMetadata = assignment.submissions.map((sub) => ({
            _id: sub._id,
            studentId: sub.studentId,
            studentName: sub.studentName,
            fileName: sub.fileName,
            fileType: sub.fileType,
            fileSize: sub.fileSize,
            submittedAt: sub.submittedAt,
            grade: sub.grade,
            feedback: sub.feedback,
        }));

        res.json({
            assignmentId: assignment._id,
            title: assignment.title,
            submissions: submissionsMetadata,
        });
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ error: "Failed to fetch submissions" });
    }
});

// GET specific submission PDF (faculty download)
router.get("/:assignmentId/submissions/:submissionId/download", async (req, res) => {
    try {
        const { assignmentId, submissionId } = req.params;
        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        const submission = assignment.submissions.id(submissionId);
        if (!submission) {
            return res.status(404).json({ error: "Submission not found" });
        }

        res.json({
            fileName: submission.fileName,
            fileType: submission.fileType,
            fileData: submission.fileData,
        });
    } catch (error) {
        console.error("Error downloading submission:", error);
        res.status(500).json({ error: "Failed to download submission" });
    }
});

// PUT grade a submission
router.put("/:assignmentId/submissions/:submissionId/grade", async (req, res) => {
    try {
        const { assignmentId, submissionId } = req.params;
        const { grade, feedback } = req.body;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        const submission = assignment.submissions.id(submissionId);
        if (!submission) {
            return res.status(404).json({ error: "Submission not found" });
        }

        submission.grade = grade;
        submission.feedback = feedback || "";
        await assignment.save();

        res.json({ message: "Grade updated successfully", submission });
    } catch (error) {
        console.error("Error grading submission:", error);
        res.status(500).json({ error: "Failed to grade submission" });
    }
});

// ==================== STUDENT ENDPOINTS ====================

// GET assignments for students (by section)
router.get("/student/:section", async (req, res) => {
    try {
        const { section } = req.params;
        const assignments = await Assignment.find({
            section: section,
            status: { $in: ["Active", "Completed"] },
        })
            .select("-submissions.fileData")
            .sort({ dueDate: 1 });

        res.json(assignments);
    } catch (error) {
        console.error("Error fetching student assignments:", error);
        res.status(500).json({ error: "Failed to fetch assignments" });
    }
});

// GET assignments for a specific student with their submission status
router.get("/student/:section/:studentId", async (req, res) => {
    try {
        const { section, studentId } = req.params;
        const assignments = await Assignment.find({
            section: section,
            status: { $in: ["Active", "Completed"] },
        })
            .select("-submissions.fileData")
            .sort({ dueDate: 1 });

        // Add student's submission status to each assignment
        const assignmentsWithStatus = assignments.map((a) => {
            const studentSubmission = a.submissions.find(
                (sub) => sub.studentId === studentId
            );
            return {
                ...a.toObject(),
                hasSubmitted: !!studentSubmission,
                submittedAt: studentSubmission?.submittedAt || null,
                grade: studentSubmission?.grade || null,
                feedback: studentSubmission?.feedback || "",
            };
        });

        res.json(assignmentsWithStatus);
    } catch (error) {
        console.error("Error fetching student assignments:", error);
        res.status(500).json({ error: "Failed to fetch assignments" });
    }
});

// POST submit assignment (student uploads PDF)
router.post("/:id/submit", async (req, res) => {
    try {
        const { id } = req.params;
        const { studentId, studentName, fileName, fileType, fileSize, fileData } =
            req.body;

        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        // Check if student already submitted
        const existingSubmission = assignment.submissions.find(
            (sub) => sub.studentId === studentId
        );

        if (existingSubmission) {
            // Update existing submission
            existingSubmission.fileName = fileName;
            existingSubmission.fileType = fileType;
            existingSubmission.fileSize = fileSize;
            existingSubmission.fileData = fileData;
            existingSubmission.submittedAt = new Date();
        } else {
            // Add new submission
            assignment.submissions.push({
                studentId,
                studentName,
                fileName,
                fileType,
                fileSize,
                fileData,
                submittedAt: new Date(),
            });
        }

        await assignment.save();

        res.json({
            message: "Assignment submitted successfully",
            submittedAt: new Date(),
        });
    } catch (error) {
        console.error("Error submitting assignment:", error);
        res.status(500).json({ error: "Failed to submit assignment" });
    }
});

// GET student's own submission for an assignment
router.get("/:assignmentId/student/:studentId/submission", async (req, res) => {
    try {
        const { assignmentId, studentId } = req.params;
        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        const submission = assignment.submissions.find(
            (sub) => sub.studentId === studentId
        );

        if (!submission) {
            return res.status(404).json({ error: "No submission found" });
        }

        res.json({
            fileName: submission.fileName,
            fileType: submission.fileType,
            fileSize: submission.fileSize,
            submittedAt: submission.submittedAt,
            grade: submission.grade,
            feedback: submission.feedback,
            // Include fileData for student to view their own submission
            fileData: submission.fileData,
        });
    } catch (error) {
        console.error("Error fetching student submission:", error);
        res.status(500).json({ error: "Failed to fetch submission" });
    }
});

module.exports = router;
