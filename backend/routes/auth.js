const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const User = require("../models/User");
const { generateToken, authenticateToken, adminOnly } = require("../middleware/auth");

// ─── Login route (admin + legacy fallback) ──────────────────────────
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
      return res.json({ message: "Login successful", user: adminUser, token });
    }

    // For non-admin: validate college ID format
    const collegeIdPattern = /^[0-9]{2}[A-Z0-9]{3}[A-Z][0-9]{2}[A-Z0-9]{1,2}$/;
    if (!collegeIdPattern.test(collegeId.toUpperCase())) {
      return res.status(401).json({ message: "Invalid college ID format" });
    }

    // Password should match college ID for initial/legacy login
    if (password !== collegeId) {
      return res.status(401).json({ message: "Invalid college ID or password" });
    }

    // Find or create user in MongoDB
    const upperCollegeId = collegeId.toUpperCase();
    let user = await User.findOne({ collegeId: upperCollegeId });

    if (!user) {
      // Parse college ID for user info
      const year = upperCollegeId.substring(0, 2);
      const section = upperCollegeId.substring(5, 6);
      const branch = upperCollegeId.substring(6, 8);
      const rollNumber = upperCollegeId.substring(8);
      const role = section === "Z" ? "faculty" : "student";

      // Try to get the name from Firebase Realtime Database
      let userName = upperCollegeId;
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
                userName = record['Name of the student'] || record.name || record.studentName || upperCollegeId;
                break;
              }
            }
          }
        }
      } catch (firebaseError) {
        console.warn('Could not fetch name from Firebase:', firebaseError.message);
      }

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
      console.log(`Auto-created new ${role} user: ${upperCollegeId}`);
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    res.json({ message: "Login successful", user, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── Firebase Login — verify Firebase ID token, return JWT + user data ──────
router.post("/firebase-login", async (req, res) => {
  try {
    const { idToken, collegeId } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Firebase ID token is required" });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;

    // Extract collegeId from email if not provided
    const resolvedCollegeId = collegeId?.toUpperCase() || email?.split("@")[0]?.toUpperCase();

    if (!resolvedCollegeId) {
      return res.status(400).json({ message: "Could not determine college ID" });
    }

    // Find or create user in MongoDB
    let user = await User.findOne({ collegeId: resolvedCollegeId });

    if (!user) {
      // Parse college ID for user info
      const year = resolvedCollegeId.substring(0, 2);
      const section = resolvedCollegeId.substring(5, 6);
      const branch = resolvedCollegeId.substring(6, 8);
      const rollNumber = resolvedCollegeId.substring(8);
      const role = section === "Z" ? "faculty" : "student";

      // Try to get the name from Firebase Realtime Database
      let userName = resolvedCollegeId;
      try {
        const db = admin.database();
        const snapshot = await db.ref('/').once('value');
        const data = snapshot.val();

        if (data) {
          for (const key in data) {
            const record = data[key];
            if (record && typeof record === 'object') {
              const recordRollNo = record['ROLL NO'] || record.rollNumber || record.collegeId;
              if (recordRollNo && recordRollNo.toUpperCase() === resolvedCollegeId) {
                userName = record['Name of the student'] || record.name || record.studentName || resolvedCollegeId;
                break;
              }
            }
          }
        }
      } catch (firebaseError) {
        console.warn('Could not fetch name from Firebase:', firebaseError.message);
      }

      user = new User({
        uid: firebaseUid,
        name: userName,
        collegeId: resolvedCollegeId,
        email: `${resolvedCollegeId}@cvr.ac.in`.toLowerCase(),
        role,
        year,
        section,
        branch,
        rollNumber,
      });
      await user.save();
      console.log(`Created MongoDB user from Firebase login: ${resolvedCollegeId}`);
    } else {
      // Update Firebase UID if it was a placeholder
      if (user.uid !== firebaseUid && user.uid.endsWith("-uid")) {
        user.uid = firebaseUid;
      }

      // Update name from Firebase if still placeholder
      const isPlaceholderName = user.name === resolvedCollegeId ||
        user.name === `User ${resolvedCollegeId}` || !user.name;

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
                if (recordRollNo && recordRollNo.toUpperCase() === resolvedCollegeId) {
                  const realName = record['Name of the student'] || record.name || record.studentName;
                  if (realName && realName !== resolvedCollegeId) {
                    user.name = realName;
                  }
                  break;
                }
              }
            }
          }
        } catch (err) {
          console.warn('Could not fetch name from Firebase:', err.message);
        }
      }
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    res.json({ message: "Login successful", user, token });
  } catch (error) {
    console.error("Firebase login error:", error);

    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({ message: "Session expired. Please sign in again." });
    }
    if (error.code === "auth/argument-error" || error.code === "auth/invalid-id-token") {
      return res.status(401).json({ message: "Invalid authentication token." });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── Provision Firebase Auth user ───────────────────────────────────
router.post("/provision", async (req, res) => {
  try {
    const { collegeId } = req.body;

    if (!collegeId) {
      return res.status(400).json({ message: "College ID is required" });
    }

    const upperCollegeId = collegeId.toUpperCase();
    const collegeIdPattern = /^[0-9]{2}[A-Z0-9]{3}[A-Z][0-9]{2}[A-Z0-9]{1,2}$/;

    if (!collegeIdPattern.test(upperCollegeId)) {
      return res.status(400).json({ message: "Invalid college ID format" });
    }

    const email = `${upperCollegeId}@cvr.ac.in`.toLowerCase();

    // Check if Firebase user already exists
    try {
      await admin.auth().getUserByEmail(email);
      // User already exists in Firebase
      return res.json({ message: "User already exists", provisioned: true });
    } catch (err) {
      if (err.code !== "auth/user-not-found") {
        throw err;
      }
    }

    // Create Firebase Auth user with initial password = collegeId
    const firebaseUser = await admin.auth().createUser({
      email: email,
      password: upperCollegeId,
      emailVerified: true,
      displayName: upperCollegeId,
    });

    console.log(`Provisioned Firebase Auth user: ${email} (uid: ${firebaseUser.uid})`);

    // Also create/update MongoDB user
    let user = await User.findOne({ collegeId: upperCollegeId });
    if (user) {
      // Update UID to Firebase UID
      if (user.uid !== firebaseUser.uid) {
        user.uid = firebaseUser.uid;
        await user.save();
      }
    }

    res.json({ message: "User provisioned successfully", provisioned: true });
  } catch (error) {
    console.error("Provision error:", error);
    res.status(500).json({ message: "Failed to provision user", error: error.message });
  }
});

// ─── Logout route ───────────────────────────────────────────────────
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Refresh token route ────────────────────────────────────────────
router.post("/refresh", authenticateToken, async (req, res) => {
  try {
    const newToken = generateToken(req.user);
    res.json({ token: newToken });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Reset password route (sends Firebase reset email) ──────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { collegeId } = req.body;

    if (!collegeId) {
      return res.status(400).json({ message: "College ID is required" });
    }

    const upperCollegeId = collegeId.toUpperCase();
    const email = `${upperCollegeId}@cvr.ac.in`.toLowerCase();

    // Check if user exists in Firebase Realtime Database
    let userName = upperCollegeId;
    let userFound = false;

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
              userName = record['Name of the student'] || record.name || record.studentName || upperCollegeId;
              userFound = true;
              console.log(`Found user in Firebase RTDB: ${userName} (${upperCollegeId})`);
              break;
            }
          }
        }
      }
    } catch (firebaseError) {
      console.warn('Could not fetch from Firebase RTDB:', firebaseError.message);
    }

    if (!userFound) {
      return res.status(404).json({ message: "User not found. Please check your User ID." });
    }

    // Ensure Firebase Auth user exists
    try {
      await admin.auth().getUserByEmail(email);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        // Create Firebase Auth user first so reset email can be sent
        await admin.auth().createUser({
          email: email,
          password: upperCollegeId,
          emailVerified: true,
          displayName: userName,
        });
        console.log(`Created Firebase Auth user for reset: ${email}`);
      } else {
        throw err;
      }
    }

    // Generate password reset link via Firebase Admin SDK
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    // Send the reset email via Nodemailer
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"CampVerse" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "🔐 CampVerse — Password Reset",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 24px 32px;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🎓 CampVerse — Password Reset</h1>
          </div>
          <div style="padding: 32px;">
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
              Hello <strong>${userName}</strong>,
            </p>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
              We received a request to reset your password for your CampVerse account 
              (<strong>${upperCollegeId}</strong>).
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" 
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
                Reset My Password
              </a>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.6;">
              If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.
            </p>
          </div>
        </div>
      `,
    });

    console.log(`Password reset email sent to: ${email}`);
    res.json({ message: "Password reset email sent to " + email });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Failed to send reset email", error: error.message });
  }
});

// ─── Change password route ──────────────────────────────────────────
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    // Update password in Firebase Auth
    const email = req.user.email;
    try {
      const firebaseUser = await admin.auth().getUserByEmail(email);
      await admin.auth().updateUser(firebaseUser.uid, {
        password: newPassword,
      });
    } catch (err) {
      console.warn("Could not update Firebase password:", err.message);
    }

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Verify token and get user data ─────────────────────────────────
router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

    const user = await User.findOne({ uid: decodedToken.uid }).select("-_id -__v");

    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    await user.updateLastLogin();

    res.json({ valid: true, user: user });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ valid: false, error: "Invalid token" });
  }
});

// ─── Create admin user in Firebase (one-time setup) ─────────────────
router.post("/setup-admin", async (req, res) => {
  try {
    const { setupKey } = req.body;

    if (setupKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({ error: "Invalid setup key" });
    }

    const existingAdmin = await User.findOne({ collegeId: "ADMIN" });
    if (existingAdmin) {
      return res.status(409).json({ error: "Admin already exists" });
    }

    const adminUser = await admin.auth().createUser({
      email: "admin@cvr.ac.in",
      password: "admin",
      displayName: "Administrator",
      emailVerified: true,
    });

    const adminData = new User({
      uid: adminUser.uid,
      name: "Administrator",
      collegeId: "ADMIN",
      email: "admin@cvr.ac.in",
      role: "admin",
    });

    await adminData.save();

    res.status(201).json({ message: "Admin user created successfully", uid: adminUser.uid });
  } catch (error) {
    console.error("Setup admin error:", error);
    res.status(500).json({ error: "Failed to setup admin" });
  }
});

// ─── Get user statistics (admin only) ───────────────────────────────
router.get("/stats", authenticateToken, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalFaculty = await User.countDocuments({ role: "faculty" });
    const activeUsers = await User.countDocuments({ isActive: true });

    const usersByYear = await User.aggregate([
      { $match: { role: { $ne: "admin" } } },
      { $group: { _id: "$year", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

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
