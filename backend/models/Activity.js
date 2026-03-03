const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
    },
    user: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        // Enum can be helpful but let's keep it flexible
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Activity", activitySchema);
