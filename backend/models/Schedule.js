const mongoose = require("mongoose");

// Slot schema - reused by both student and faculty schedules
const slotSchema = new mongoose.Schema({
    slotNumber: { type: Number, required: true },
    courseCode: { type: String, default: "" }, // Unified cross-module mapping
    subjectCode: { type: String, default: "" }, // Legacy fallback
    subjectName: { type: String, default: "" },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    facultyName: { type: String, default: "" },
    facultyId: { type: String, default: "" },
    room: { type: String, default: "" },
    classType: { type: String, default: "Class", enum: ["Class", "Lab", "Tutorial", "Sports", "Library", "Mentoring", "Review"] },
    className: { type: String, default: "" },   // e.g. "III Year" - used in faculty schedules
    section: { type: String, default: "" },      // e.g. "A" - used in faculty schedules
});

// Day schedule schema
const dayScheduleSchema = new mongoose.Schema({
    day: { type: String, required: true, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
    slots: [slotSchema],
});

// Main schedule schema - supports both student and faculty schedule types
const scheduleSchema = new mongoose.Schema(
    {
        // "student" or "faculty"
        scheduleType: {
            type: String,
            required: true,
            enum: ["student", "faculty"],
            default: "student",
        },

        // ─── Student schedule fields ───
        year: { type: String },        // e.g. "22" for 2022 batch
        branch: { type: String },      // e.g. "05" for CSE
        section: { type: String },     // e.g. "A", "B"
        semester: { type: String },    // e.g. "VI"
        degree: { type: String },      // e.g. "Major", "Minor"

        // ─── Faculty schedule fields ───
        department: { type: String },  // e.g. "CSE", "ECE"
        rollNumber: { type: String },  // Faculty roll/ID number

        // ─── Common fields ───
        schedule: [dayScheduleSchema],
        createdBy: { type: String, default: "admin" },
    },
    {
        timestamps: true, // adds createdAt, updatedAt automatically
    }
);

// Index for fast lookups
scheduleSchema.index({ scheduleType: 1 });
scheduleSchema.index({ scheduleType: 1, year: 1, branch: 1, section: 1, semester: 1 });
scheduleSchema.index({ scheduleType: 1, department: 1, rollNumber: 1 });

module.exports = mongoose.model("Schedule", scheduleSchema);
