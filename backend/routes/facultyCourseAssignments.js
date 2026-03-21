const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const FacultyCourseAssignment = require("../models/FacultyCourseAssignment");
const Course = require("../models/Course");

// GET /api/faculty-assignments?facultyId=123
// Get assignments mapped to courses
router.get("/", async (req, res) => {
    try {
        const { facultyId } = req.query;
        let query = {};
        if (facultyId) {
            query.facultyId = facultyId;
        }

        const assignments = await FacultyCourseAssignment.find(query);
        
        // Populate additional dynamically assigned course data using their corresponding records naturally mapped
        const populatedAssignments = await Promise.all(assignments.map(async (assignment) => {
            const course = await Course.findOne({ courseCode: assignment.courseCode });
            return {
                ...assignment.toObject(),
                courseName: course ? course.courseName : ""
            };
        }));

        res.json(populatedAssignments);
    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({ error: "Failed to fetch assignments" });
    }
});

// POST /api/faculty-assignments
// Admin/Faculty can create mapping
router.post("/", async (req, res) => {
    try {
        const { facultyId, courseCode, sections, department, year, semester } = req.body;
        
        // Prevent strictly duplicate definitions entirely
        const existing = await FacultyCourseAssignment.findOne({ facultyId, courseCode });
        if (existing) {
            existing.sections = [...new Set([...existing.sections, ...sections])];
            existing.department = department || existing.department;
            existing.year = year || existing.year;
            existing.semester = semester || existing.semester;
            await existing.save();
            return res.json(existing);
        }

        const newAssignment = new FacultyCourseAssignment({
            facultyId,
            courseCode,
            sections,
            department,
            year,
            semester,
        });

        const savedAssignment = await newAssignment.save();
        res.status(201).json(savedAssignment);
    } catch (error) {
        console.error("Error creating assignment mapping:", error);
        res.status(500).json({ error: "Failed to create mapping" });
    }
});

module.exports = router;
