const mongoose = require("mongoose");

// Schema for individual student grades per subject
const studentGradeSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
    },
    studentName: {
        type: String,
        default: "",
    },
    // Mid-1 marks (out of 40)
    mid1: {
        type: Number,
        min: 0,
        max: 40,
        default: null,
    },
    // Assignment-1 marks (out of 5)
    assignment1: {
        type: Number,
        min: 0,
        max: 5,
        default: null,
    },
    // Mid-2 marks (out of 40)
    mid2: {
        type: Number,
        min: 0,
        max: 40,
        default: null,
    },
    // Assignment-2 marks (out of 5)
    assignment2: {
        type: Number,
        min: 0,
        max: 5,
        default: null,
    },
    // Project marks (out of 5)
    project: {
        type: Number,
        min: 0,
        max: 5,
        default: null,
    },
    // External marks (out of 60) - added by admin
    external: {
        type: Number,
        min: 0,
        max: 60,
        default: null,
    },
    // Calculated fields (stored for quick access)
    mid1Converted: {
        type: Number,
        default: null,
    },
    mid2Converted: {
        type: Number,
        default: null,
    },
    mid1Total: {
        type: Number,
        default: null,
    },
    mid2Total: {
        type: Number,
        default: null,
    },
    internalMarks: {
        type: Number,
        default: null,
    },
    totalMarks: {
        type: Number,
        default: null,
    },
    grade: {
        type: String,
        default: null,
    },
    gradePoints: {
        type: Number,
        default: null,
    },
});

// Main Grade Sheet schema (per subject per section)
const gradeSheetSchema = new mongoose.Schema({
    // Subject details
    subjectCode: {
        type: String,
        required: true,
    },
    subjectName: {
        type: String,
        required: true,
    },
    credits: {
        type: Number,
        default: 3,
    },
    // Meta details
    degree: {
        type: String,
        default: "Major",
        required: false,
    },
    // Class details
    year: {
        type: String,
        required: true,
    },
    branch: {
        type: String,
        required: true,
    },
    section: {
        type: String,
        required: true,
    },
    semester: {
        type: String,
        required: true,
    },
    academicYear: {
        type: String,
        required: false,
        default: "",
    },
    // Faculty who created/manages this
    facultyId: {
        type: String,
        required: true,
    },
    facultyName: {
        type: String,
        default: "Faculty",
    },
    // Student grades
    studentGrades: [studentGradeSchema],
    // Status
    status: {
        type: String,
        enum: ["Draft", "Submitted", "Published"],
        default: "Draft",
    },
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    publishedAt: {
        type: Date,
        default: null,
    },
    publishedBy: {
        type: String,
        default: null,
    },
});

// Pre-save middleware to calculate derived fields
gradeSheetSchema.pre("save", function (next) {
    this.updatedAt = new Date();

    // Calculate derived fields for each student
    this.studentGrades.forEach((student) => {
        // Mid-1 converted (×0.75)
        if (student.mid1 !== null) {
            student.mid1Converted = Math.round(student.mid1 * 0.75 * 100) / 100;
        }

        // Mid-2 converted (×0.75)
        if (student.mid2 !== null) {
            student.mid2Converted = Math.round(student.mid2 * 0.75 * 100) / 100;
        }

        // Mid-1 Total = Mid-1 Converted + Assignment-1
        if (student.mid1Converted !== null && student.assignment1 !== null) {
            student.mid1Total = student.mid1Converted + student.assignment1;
        }

        // Mid-2 Total = Mid-2 Converted + Assignment-2
        if (student.mid2Converted !== null && student.assignment2 !== null) {
            student.mid2Total = student.mid2Converted + student.assignment2;
        }

        // Internal = ((Mid-1 Total + Mid-2 Total) / 2) + Project
        if (
            student.mid1Total !== null &&
            student.mid2Total !== null &&
            student.project !== null
        ) {
            const average = (student.mid1Total + student.mid2Total) / 2;
            student.internalMarks = Math.round((average + student.project) * 100) / 100;
        }

        // Total = Internal + External
        if (student.internalMarks !== null && student.external !== null) {
            student.totalMarks = student.internalMarks + student.external;

            // Calculate grade based on total marks
            const total = student.totalMarks;
            if (total >= 90) {
                student.grade = "O";
                student.gradePoints = 10;
            } else if (total >= 80) {
                student.grade = "A+";
                student.gradePoints = 9;
            } else if (total >= 70) {
                student.grade = "A";
                student.gradePoints = 8;
            } else if (total >= 60) {
                student.grade = "B+";
                student.gradePoints = 7;
            } else if (total >= 50) {
                student.grade = "B";
                student.gradePoints = 6;
            } else if (total >= 40) {
                student.grade = "C";
                student.gradePoints = 5;
            } else {
                student.grade = "F";
                student.gradePoints = 0;
            }
        }
    });

    next();
});

// Virtual to get student count
gradeSheetSchema.virtual("studentCount").get(function () {
    return this.studentGrades.length;
});

module.exports = mongoose.model("GradeSheet", gradeSheetSchema);
