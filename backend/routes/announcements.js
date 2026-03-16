const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");

// Get all announcements (for Admin)
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

// Get active announcements by audience (Students, Faculty, Both)
router.get("/active", async (req, res) => {
  try {
    const { audience } = req.query; // e.g., ?audience=Students
    const query = {
      $or: [{ expiryDate: null }, { expiryDate: { $gte: new Date() } }],
    };

    if (audience) {
      query.audience = { $in: [audience, "Both"] };
    }

    const announcements = await Announcement.find(query).sort({
      createdAt: -1,
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch active announcements" });
  }
});

// Create a new announcement
router.post("/", async (req, res) => {
  try {
    const announcement = new Announcement(req.body);
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

// Delete an announcement
router.delete("/:id", async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

module.exports = router;
