const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Important", "Normal", "Low"],
      default: "Normal",
    },
    audience: {
      type: String,
      required: true,
      enum: ["Students", "Faculty", "Both"],
    },
    createdBy: {
      type: String,
      default: "Admin",
    },
    image: {
      type: String,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Method to check if announcement is visible (not expired)
announcementSchema.methods.isVisible = function () {
  if (!this.expiryDate) return true;
  return new Date() <= this.expiryDate;
};

module.exports = mongoose.model("Announcement", announcementSchema);
