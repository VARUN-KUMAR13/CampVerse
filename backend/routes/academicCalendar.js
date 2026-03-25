const express = require("express");
const router = express.Router();
const AcademicCalendar = require("../models/AcademicCalendar");

// Get all events
router.get("/", async (req, res) => {
  try {
    const { collegeId, semester, degree, year } = req.query;
    if (!collegeId) {
      return res.status(400).json({ error: "collegeId is required" });
    }
    const query = { collegeId };
    
    if (semester && semester !== "All") {
      query.$and = query.$and || [];
      query.$and.push({ $or: [{ semester }, { semester: { $exists: false } }, { semester: "" }] });
    }
    if (degree && degree !== "All") {
      query.$and = query.$and || [];
      query.$and.push({ $or: [{ degree }, { degree: { $exists: false } }, { degree: "" }] });
    }
    if (year && year !== "All") {
      query.$and = query.$and || [];
      query.$and.push({ $or: [{ year }, { year: { $exists: false } }, { year: "" }] });
    }
    const events = await AcademicCalendar.find(query).sort({ startDate: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create event
router.post("/", async (req, res) => {
  try {
    const { collegeId, semester, degree, year, title, type, startDate, endDate, color, tagLabel } = req.body;
    
    // Auto Tag Generation handling
    let generatedTag = tagLabel;
    if (!generatedTag) {
      const sDate = new Date(startDate);
      const eDate = new Date(endDate);
      const diffTime = Math.abs(eDate - sDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
      
      if (diffDays === 1) generatedTag = "1 Day";
      else if (diffDays === 7) generatedTag = "1 Week";
      else generatedTag = `${diffDays} Days`;
    }

    const newEvent = new AcademicCalendar({
      collegeId, 
      semester, 
      degree,
      year,
      title, 
      type, 
      startDate, 
      endDate, 
      color, 
      tagLabel: generatedTag
    });
    
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update event
router.put("/:id", async (req, res) => {
  try {
    let updateData = { ...req.body };
    
    // Auto Tag Generation handling if dates or tag label change
    if (updateData.startDate && updateData.endDate && updateData.tagLabel === "") {
      const sDate = new Date(updateData.startDate);
      const eDate = new Date(updateData.endDate);
      const diffTime = Math.abs(eDate - sDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays === 1) updateData.tagLabel = "1 Day";
      else if (diffDays === 7) updateData.tagLabel = "1 Week";
      else updateData.tagLabel = `${diffDays} Days`;
    }

    const updated = await AcademicCalendar.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete event
router.delete("/:id", async (req, res) => {
  try {
    await AcademicCalendar.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
