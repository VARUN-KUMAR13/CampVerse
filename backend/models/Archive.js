const mongoose = require("mongoose");

const archiveSchema = new mongoose.Schema(
    {
        batch: {
            type: String, // e.g., "2020-2024"
            required: true,
            index: true,
        },
        dataType: {
            type: String,
            enum: ["users", "attendance", "results"],
            required: true,
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        archivedAt: {
            type: Date,
            default: Date.now,
        },
        archivedBy: {
            type: String, // admin ID or system
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for history queries
archiveSchema.index({ batch: 1, dataType: 1 });

module.exports = mongoose.model("Archive", archiveSchema);
