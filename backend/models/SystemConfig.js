const mongoose = require("mongoose");

const systemConfigSchema = new mongoose.Schema(
    {
        academicYear: {
            type: String,
            required: true,
            default: "2023-2024",
        },
        defaultSemester: {
            type: String,
            enum: ["Odd", "Even"],
            default: "Odd",
        },
        attendanceThresholds: {
            fourWeeks: { type: Number, default: 75 },
            eightWeeks: { type: Number, default: 75 },
            twelveWeeks: { type: Number, default: 75 },
            sixteenWeeks: { type: Number, default: 75 },
        },
        cgpaFormulaWeights: {
            // Configuration for how CGPA is computed natively
            assignments: { type: Number, default: 20 },
            midTerms: { type: Number, default: 30 },
            finalExams: { type: Number, default: 50 },
        },
        globalNotifications: {
            emailAlerts: { type: Boolean, default: true },
            smsAlerts: { type: Boolean, default: false },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("SystemConfig", systemConfigSchema);
