const express = require("express");
const router = express.Router();
const Schedule = require("../models/Schedule");

// ───────────────────────────────────────────────
// GET /api/schedules
// Query params: scheduleType, year, branch, section, semester, degree, department, rollNumber
// ───────────────────────────────────────────────
router.get("/", async (req, res) => {
    try {
        const filter = {};

        if (req.query.scheduleType) filter.scheduleType = req.query.scheduleType;
        if (req.query.year) filter.year = req.query.year;
        if (req.query.branch) filter.branch = req.query.branch;
        if (req.query.section) filter.section = req.query.section;
        if (req.query.semester) filter.semester = req.query.semester;
        if (req.query.degree) filter.degree = req.query.degree;
        if (req.query.department) filter.department = req.query.department;
        if (req.query.rollNumber) filter.rollNumber = req.query.rollNumber;
        
        // Filter by facultyId within slots (searches both student and faculty schedules)
        if (req.query.facultyId) {
            filter["schedule.slots.facultyId"] = req.query.facultyId;
        }

        const schedules = await Schedule.find(filter).sort({ updatedAt: -1 });
        res.json(schedules);
    } catch (error) {
        console.error("Error fetching schedules:", error);
        res.status(500).json({ message: "Failed to fetch schedules", error: error.message });
    }
});

// ───────────────────────────────────────────────
// GET /api/schedules/:id
// ───────────────────────────────────────────────
router.get("/:id", async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: "Schedule not found" });
        }
        res.json(schedule);
    } catch (error) {
        console.error("Error fetching schedule:", error);
        res.status(500).json({ message: "Failed to fetch schedule", error: error.message });
    }
});

// ───────────────────────────────────────────────
// POST /api/schedules
// Create a new schedule (student or faculty)
// ───────────────────────────────────────────────
router.post("/", async (req, res) => {
    try {
        const { scheduleType, year, branch, section, semester, degree, department, rollNumber, schedule, createdBy } = req.body;

        if (!scheduleType) {
            return res.status(400).json({ message: "scheduleType is required (student or faculty)" });
        }

        // Check for duplicate
        let duplicateFilter = { scheduleType };
        if (scheduleType === "student") {
            duplicateFilter = { ...duplicateFilter, year, branch, section, semester };
        } else {
            duplicateFilter = { ...duplicateFilter, department, rollNumber };
        }

        const existing = await Schedule.findOne(duplicateFilter);
        if (existing) {
            return res.status(409).json({ message: "A schedule with these parameters already exists", existingId: existing._id });
        }

        const newSchedule = new Schedule({
            scheduleType,
            year,
            branch,
            section,
            semester,
            degree,
            department,
            rollNumber,
            schedule: schedule || [],
            createdBy: createdBy || "admin",
        });

        const saved = await newSchedule.save();
        res.status(201).json(saved);
    } catch (error) {
        console.error("Error creating schedule:", error);
        res.status(500).json({ message: "Failed to create schedule", error: error.message });
    }
});

// ───────────────────────────────────────────────
// PUT /api/schedules/:id
// Update an existing schedule
// ───────────────────────────────────────────────
router.put("/:id", async (req, res) => {
    try {
        const updated = await Schedule.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Schedule not found" });
        }

        res.json(updated);
    } catch (error) {
        console.error("Error updating schedule:", error);
        res.status(500).json({ message: "Failed to update schedule", error: error.message });
    }
});

// ───────────────────────────────────────────────
// DELETE /api/schedules/:id
// ───────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Schedule.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Schedule not found" });
        }
        res.json({ message: "Schedule deleted successfully" });
    } catch (error) {
        console.error("Error deleting schedule:", error);
        res.status(500).json({ message: "Failed to delete schedule", error: error.message });
    }
});

module.exports = router;
