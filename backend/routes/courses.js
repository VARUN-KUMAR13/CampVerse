const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// ─── GET all courses ─────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
    try {
        const { facultyId } = req.query;
        const filter = facultyId ? { facultyId } : {};
        const courses = await Course.find(filter).select("-resources.fileData").sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});

// ─── GET single course by ID ─────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).select("-resources.fileData");
        if (!course) return res.status(404).json({ error: "Course not found" });
        res.json(course);
    } catch (error) {
        console.error("Error fetching course:", error);
        res.status(500).json({ error: "Failed to fetch course" });
    }
});

// ─── POST create a new course ────────────────────────────────────────────────
router.post("/", async (req, res) => {
    try {
        const {
            courseCode,
            courseName,
            credits,
            maxStudents,
            description,
            objectives,
            syllabus,
            resources,
            facultyId,
            facultyName,
            color,
        } = req.body;

        // Check for duplicate course code
        const existing = await Course.findOne({ courseCode: courseCode.toUpperCase() });
        if (existing) {
            return res.status(400).json({ error: "A course with this code already exists" });
        }

        const course = new Course({
            courseCode: courseCode.toUpperCase(),
            courseName,
            credits: Number(credits),
            maxStudents: Number(maxStudents),
            description: description || "",
            objectives: objectives || [],
            syllabus: syllabus || [],
            resources: resources || [],
            facultyId,
            facultyName,
            status: "Active",
            color: color || "bg-blue-500",
        });

        await course.save();
        res.status(201).json(course);
    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({ error: "Failed to create course" });
    }
});

// ─── PUT update a course ─────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!course) return res.status(404).json({ error: "Course not found" });
        res.json(course);
    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ error: "Failed to update course" });
    }
});

// ─── DELETE a course ─────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ error: "Course not found" });
        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ error: "Failed to delete course" });
    }
});

// ─── POST upload resource to a course ────────────────────────────────────────
router.post("/:id/resources", async (req, res) => {
    try {
        const { name, type, fileData, fileName, fileSize } = req.body;
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: "Course not found" });

        course.resources.push({
            name,
            type: type || "PDF",
            fileData,
            fileName,
            fileSize,
            uploadedAt: new Date(),
        });

        await course.save();
        res.json(course);
    } catch (error) {
        console.error("Error uploading resource:", error);
        res.status(500).json({ error: "Failed to upload resource" });
    }
});

// ─── DELETE a resource from a course ─────────────────────────────────────────
router.delete("/:id/resources/:resourceId", async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: "Course not found" });

        course.resources = course.resources.filter(
            (r) => r._id.toString() !== req.params.resourceId
        );
        await course.save();
        res.json(course);
    } catch (error) {
        console.error("Error deleting resource:", error);
        res.status(500).json({ error: "Failed to delete resource" });
    }
});

// ─── GET download a resource from a course ───────────────────────────────────
router.get("/:id/resources/:resourceId/download", async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).select("resources");
        if (!course) return res.status(404).json({ error: "Course not found" });

        const resource = course.resources.id(req.params.resourceId);
        if (!resource || !resource.fileData) {
            return res.status(404).json({ error: "Resource specific file data not found" });
        }

        res.json({ fileData: resource.fileData, fileName: resource.fileName, name: resource.name });
    } catch (error) {
        console.error("Error downloading resource:", error);
        res.status(500).json({ error: "Failed to download resource" });
    }
});

module.exports = router;
