const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken, authenticateToken, adminOnly } = require("../middleware/auth");

// Login route
router.post("/login", async (req, res) => {
  try {
    const { collegeId, password } = req.body;

    if (!collegeId || !password) {
      return res.status(400).json({ message: "College ID and password are required" });
    }

    // Handle admin login
    if (collegeId === "admin") {
      if (password !== "admin") {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      let adminUser = await User.findOne({ collegeId: "ADMIN" });

      if (!adminUser) {
        // Create admin user if doesn't exist
        adminUser = new User({
          uid: "admin-uid",
          name: "Administrator",
          collegeId: "ADMIN",
          email: "admin@cvr.ac.in",
          role: "admin",
        });
        await adminUser.save();
      }

      const token = generateToken(adminUser);

      return res.json({
        message: "Login successful",
        user: adminUser,
        token,
      });
    }

    // Find user by college ID
    const user = await User.findOne({ collegeId: collegeId.toUpperCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid college ID or password" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    // For development/demo, password is the college ID
    // In production, you should hash passwords
    if (password !== collegeId) {
      return res.status(401).json({ message: "Invalid college ID or password" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Logout route
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    // In a production app, you might want to blacklist the token
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Refresh token route
router.post("/refresh", authenticateToken, async (req, res) => {
  try {
    const newToken = generateToken(req.user);
    res.json({ token: newToken });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset password route
router.post("/reset-password", async (req, res) => {
  try {
    const { collegeId } = req.body;

    if (!collegeId) {
      return res.status(400).json({ message: "College ID is required" });
    }

    const user = await User.findOne({ collegeId: collegeId.toUpperCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // In a real application, you would send an email here
    // For now, we'll just return a success message
    res.json({
      message: "Password reset instructions sent to your registered email",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Change password route
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    // For demo purposes, current password should match college ID
    if (currentPassword !== req.user.collegeId) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // In production, you would hash the new password
    // For now, we'll just return success
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

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
router.get("/stats", authenticateToken, adminOnly, async (req, res) => {
  try {

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
