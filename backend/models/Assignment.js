const mongoose = require("mongoose");

// Schema for individual submissions
const submissionSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
    },
    studentName: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        default: "application/pdf",
    },
    fileSize: {
        type: Number,
        required: true,
    },
    // Store PDF as base64 encoded string
    fileData: {
        type: String,
        required: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    grade: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
    },
    feedback: {
        type: String,
        default: "",
    },
});

// Main Assignment schema
const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    course: {
        type: String,
        required: true,
    },
    courseCode: {
        type: String,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    createdBy: {
        type: String, // Faculty ID
        required: true,
    },
    createdByName: {
        type: String,
        default: "Faculty",
    },
    section: {
        type: String,
        default: "B",
    },
    branch: {
        type: String,
        default: "CSE",
    },
    year: {
        type: String,
        default: "2022",
    },
    maxMarks: {
        type: Number,
        default: 100,
    },
    submissions: [submissionSchema],
    status: {
        type: String,
        enum: ["Active", "Completed", "Draft"],
        default: "Active",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the updatedAt field before saving
assignmentSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

// Virtual to get submission count
assignmentSchema.virtual("submissionCount").get(function () {
    return this.submissions.length;
});

// Method to check if assignment is overdue
assignmentSchema.methods.isOverdue = function () {
    return new Date() > this.dueDate;
};

// Method to get submission for a specific student
assignmentSchema.methods.getStudentSubmission = function (studentId) {
    return this.submissions.find((sub) => sub.studentId === studentId);
};

module.exports = mongoose.model("Assignment", assignmentSchema);
