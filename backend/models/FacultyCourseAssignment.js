const mongoose = require("mongoose");

const facultyCourseAssignmentSchema = new mongoose.Schema(
    {
        facultyId: {
            type: String,
            required: true,
        },
        courseCode: {
            type: String,
            required: true,
        },
        sections: {
            type: [String],
            required: true,
        },
        department: {
            type: String,
            required: true,
        },
        year: {
            type: String,
            required: true,
        },
        semester: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure a faculty isn't double assigned to the exact same course accidentally
facultyCourseAssignmentSchema.index({ facultyId: 1, courseCode: 1 }, { unique: true });

module.exports = mongoose.model("FacultyCourseAssignment", facultyCourseAssignmentSchema);
