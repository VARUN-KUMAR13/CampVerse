const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        courseCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },
        courseName: {
            type: String,
            required: true,
            trim: true,
        },
        credits: {
            type: Number,
            required: true,
            min: 1,
            max: 10,
        },
        maxStudents: {
            type: Number,
            required: true,
            min: 1,
        },
        description: {
            type: String,
            default: "",
        },
        objectives: {
            type: [String],
            default: [],
        },
        syllabus: [
            {
                topic: { type: String, required: true },
                duration: { type: String, default: "" },
            },
        ],
        resources: [
            {
                name: { type: String, required: true },
                type: { type: String, default: "PDF" }, // PDF, DOC, etc.
                fileData: { type: String }, // base64-encoded file content
                fileName: { type: String },
                fileSize: { type: Number },
                uploadedAt: { type: Date, default: Date.now },
            },
        ],
        facultyId: {
            type: String,
            required: true,
        },
        facultyName: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive", "Completed"],
            default: "Active",
        },
        color: {
            type: String,
            default: "bg-blue-500",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Course", courseSchema);
