const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken, authenticateToken, adminOnly } = require("../middleware/auth");

// Verify token and get user data
router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Get user data from MongoDB
    const user = await User.findOne({ uid: decodedToken.uid }).select(
      "-_id -__v",
    );

    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    // Update last login
    await user.updateLastLogin();

    res.json({
      valid: true,
      user: user,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      valid: false,
      error: "Invalid token",
    });
  }
});

// Create admin user in Firebase (one-time setup)
router.post("/setup-admin", async (req, res) => {
  try {
    const { setupKey } = req.body;

    // Simple protection for admin setup
    if (setupKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({ error: "Invalid setup key" });
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ collegeId: "ADMIN" });
    if (existingAdmin) {
      return res.status(409).json({ error: "Admin already exists" });
    }

    // Create admin user in Firebase
    const adminUser = await admin.auth().createUser({
      email: "admin@cvr.ac.in",
      password: "admin",
      displayName: "Administrator",
      emailVerified: true,
    });

    // Create admin user in MongoDB
    const adminData = new User({
      uid: adminUser.uid,
      name: "Administrator",
      collegeId: "ADMIN",
      email: "admin@cvr.ac.in",
      role: "admin",
    });

    await adminData.save();

    res.status(201).json({
      message: "Admin user created successfully",
      uid: adminUser.uid,
    });
  } catch (error) {
    console.error("Setup admin error:", error);
    res.status(500).json({ error: "Failed to setup admin" });
  }
});

// Get user statistics (admin only)
router.get("/stats", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const requestingUser = await User.findOne({ uid: decodedToken.uid });

    if (!requestingUser || requestingUser.role !== "admin") {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // Get statistics
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalFaculty = await User.countDocuments({ role: "faculty" });
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get users by year
    const usersByYear = await User.aggregate([
      { $match: { role: { $ne: "admin" } } },
      { $group: { _id: "$year", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Get users by branch
    const usersByBranch = await User.aggregate([
      { $match: { role: { $ne: "admin" } } },
      { $group: { _id: "$branch", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalUsers,
      totalStudents,
      totalFaculty,
      activeUsers,
      usersByYear,
      usersByBranch,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Failed to get statistics" });
  }
});

module.exports = router;
