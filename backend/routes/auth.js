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
    let user = await User.findOne({ collegeId: collegeId.toUpperCase() });

    // If user doesn't exist, try to create them (for development/demo)
    if (!user) {
      // Validate college ID format: YYBBBSBBR (e.g., 22B81A05C3)
      const collegeIdPattern = /^[0-9]{2}[A-Z0-9]{3}[A-Z][0-9]{2}[A-Z0-9]{1,2}$/;

      if (!collegeIdPattern.test(collegeId.toUpperCase())) {
        return res.status(401).json({ message: "Invalid college ID format" });
      }

      // Password should match college ID for new users
      if (password !== collegeId) {
        return res.status(401).json({ message: "Invalid college ID or password" });
      }

      // Parse college ID for user info
      const upperCollegeId = collegeId.toUpperCase();
      const year = upperCollegeId.substring(0, 2);
      const section = upperCollegeId.substring(5, 6);
      const branch = upperCollegeId.substring(6, 8);
      const rollNumber = upperCollegeId.substring(8);

      // Determine role based on section (Z = faculty, others = student)
      const role = section === "Z" ? "faculty" : "student";

      // Try to get the name from Firebase Realtime Database
      let userName = upperCollegeId; // Default to college ID if name not found
      try {
        const db = admin.database();
        const snapshot = await db.ref('/').once('value');
        const data = snapshot.val();

        if (data) {
          // Search for student with matching roll number
          for (const key in data) {
            const record = data[key];
            if (record && typeof record === 'object') {
              const recordRollNo = record['ROLL NO'] || record.rollNumber || record.collegeId;
              if (recordRollNo && recordRollNo.toUpperCase() === upperCollegeId) {
                userName = record['Name of the student'] || record.name || record.studentName || upperCollegeId;
                console.log(`Found student name in Firebase: ${userName}`);
                break;
              }
            }
          }
        }
      } catch (firebaseError) {
        console.warn('Could not fetch name from Firebase:', firebaseError.message);
      }

      // Create new user
      user = new User({
        uid: `${upperCollegeId}-uid`,
        name: userName,
        collegeId: upperCollegeId,
        email: `${upperCollegeId}@cvr.ac.in`,
        role,
        year,
        section,
        branch,
        rollNumber,
      });

      await user.save();
      console.log(`Auto-created new ${role} user: ${upperCollegeId} (Name: ${userName})`);
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    // For development/demo, password is the college ID
    // In production, you should hash passwords
    if (password !== user.collegeId && password !== collegeId) {
      return res.status(401).json({ message: "Invalid college ID or password" });
    }

    // If user's name is just their college ID or a placeholder, try to fetch real name from Firebase
    const upperCollegeId = collegeId.toUpperCase();
    const isPlaceholderName = user.name === upperCollegeId ||
      user.name === `User ${upperCollegeId}` ||
      user.name === collegeId ||
      !user.name;

    if (isPlaceholderName) {
      try {
        const db = admin.database();
        const snapshot = await db.ref('/').once('value');
        const data = snapshot.val();

        if (data) {
          for (const key in data) {
            const record = data[key];
            if (record && typeof record === 'object') {
              const recordRollNo = record['ROLL NO'] || record.rollNumber || record.collegeId;
              if (recordRollNo && recordRollNo.toUpperCase() === upperCollegeId) {
                const realName = record['Name of the student'] || record.name || record.studentName;
                if (realName && realName !== upperCollegeId) {
                  user.name = realName;
                  console.log(`Updated user name from Firebase: ${realName}`);
                }
                break;
              }
            }
          }
        }
      } catch (firebaseError) {
        console.warn('Could not fetch name from Firebase for update:', firebaseError.message);
      }
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
