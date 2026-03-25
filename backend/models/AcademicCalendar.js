const mongoose = require("mongoose");

const academicCalendarSchema = new mongoose.Schema({
  collegeId: { type: String, required: true },
  semester: { 
    type: String, 
    required: true
  },
  degree: { type: String },
  year: { type: String },
  title: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["Academic", "Exam", "Holiday"]
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  color: { type: String, required: true },
  tagLabel: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AcademicCalendar", academicCalendarSchema);
