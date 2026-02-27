const express = require("express");
const router = express.Router();
const User = require("../models/User");
const admin = require("firebase-admin");
const Joi = require("joi");

// Validation schemas
const createUserSchema = Joi.object({
  uid: Joi.string().required(),
  name: Joi.string().min(2).max(100).required(),
  collegeId: Joi.string()
    .pattern(/^([0-9]{2}[A-Z0-9]{3}[A-Z][0-9]{2}[A-Z0-9]{1,2}|ADMIN)$/)
    .required(),
  email: Joi.string()
    .email()
    .pattern(/@cvr\.ac\.in$/)
    .required(),
  role: Joi.string().valid("student", "faculty", "admin").required(),
  year: Joi.string().when("role", {
    is: "admin",
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  section: Joi.string().when("role", {
    is: "admin",
    then: Joi.optional(),
    otherwise: Joi.string()
      .pattern(/^[A-Z]$/)
      .required(),
  }),
  branch: Joi.string().when("role", {
    is: "admin",
    then: Joi.optional(),
    otherwise: Joi.string()
      .pattern(/^[0-9]{2}$/)
      .required(),
  }),
  rollNumber: Joi.string().when("role", {
    is: "admin",
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
});

// Middleware to verify Firebase token or JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    // If no token, check if we're in development and allow self-updates
    if (!token) {
      // In development, allow updates if the UID in the URL matches the request
      if (process.env.NODE_ENV !== 'production') {
        console.log("⚠️ No auth token - allowing in development mode");
        req.user = { uid: req.params.uid };
        return next();
      }
      return res.status(401).json({ error: "No token provided" });
    }

    // Try Firebase token verification first
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      return next();
    } catch (firebaseError) {
      // If Firebase verification fails, try JWT verification
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campverse-secret-key');
        req.user = { uid: decoded.uid || decoded.id || req.params.uid };
        return next();
      } catch (jwtError) {
        // In development, still allow if token exists but verification fails
        if (process.env.NODE_ENV !== 'production') {
          console.log("⚠️ Token verification failed - allowing in development mode");
          req.user = { uid: req.params.uid };
          return next();
        }
        throw jwtError;
      }
    }
  } catch (error) {
    console.error("Token verification error:", error.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Create new user
router.post("/", async (req, res) => {
  try {
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { uid: value.uid },
        { collegeId: value.collegeId },
        { email: value.email },
      ],
    });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Create new user
    const user = new User(value);
    await user.save();

    // Return user data without sensitive information
    const userResponse = user.toObject();
    delete userResponse._id;
    delete userResponse.__v;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Get user by UID
router.get("/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update last login
    await user.updateLastLogin();

    // Strip internal MongoDB fields before responding
    const userObj = user.toObject();
    delete userObj._id;
    delete userObj.__v;

    res.json(userObj);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Get user by college ID
router.get("/college-id/:collegeId", async (req, res) => {
  try {
    const user = await User.findOne({
      collegeId: req.params.collegeId.toUpperCase(),
    }).select("-_id -__v");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user by college ID error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Update user profile (protected route) - creates user if not exists
router.put("/:uid", verifyToken, async (req, res) => {
  try {
    // Only allow updating certain fields
    const allowedUpdates = [
      "name",
      "phone",
      "address",
      "dateOfBirth",
      "bio",
      "cgpa",
      "branch",
      "section",
      "semester",
      "skills",
      "achievements",
      "avatar",
      "projects",
      "certifications",
      "linkedin",
      "github",
      "portfolio",
      "twitter",
    ];
    const updates = {};

    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid updates provided" });
    }

    // Try to find and update existing user
    let user = await User.findOneAndUpdate({ uid: req.params.uid }, updates, {
      new: true,
      runValidators: true,
    }).select("-_id -__v");

    // If user doesn't exist, create them (for development mode)
    if (!user) {
      console.log("🆕 Creating new user profile for UID:", req.params.uid);

      // Extract college ID from UID (remove -uid suffix if present)
      const collegeId = req.params.uid.replace(/-uid$/, '').toUpperCase();

      // Derive branch and section from college ID if possible
      // Format: 22B81A05C3 -> year=22, branch=05, section derived from roll
      let year = "22";
      let branch = "05"; // CSE default
      let section = "B"; // Default section
      let rollNumber = collegeId;

      // Attempt to intelligently infer the role from the incoming collegeID or request data.
      let role = "student";
      // We look for 'Z' pattern often used for faculty (e.g., 22B81Z05C3), or if designation/availability is sent
      if (collegeId.includes("Z") || updates.designation || updates.availability) {
        role = "faculty";
        section = "Z";
      }

      if (collegeId.match(/^[0-9]{2}[A-Z0-9]{3}[A-Z][0-9]{2}[A-Z0-9]{1,2}$/)) {
        year = collegeId.substring(0, 2);
        branch = collegeId.substring(6, 8);
      }

      // Create minimal user with required fields
      const newUserData = {
        uid: req.params.uid,
        collegeId: collegeId,
        email: `${collegeId.toLowerCase()}@cvr.ac.in`,
        role: updates.role || role,
        year: year,
        branch: updates.branch || branch,
        section: updates.section || section,
        rollNumber: rollNumber,
        name: updates.name || collegeId,
        ...updates,
      };

      try {
        user = new User(newUserData);
        await user.save();
        console.log("✅ Created new user:", collegeId);

        // Return without MongoDB internal fields
        const userObj = user.toObject();
        delete userObj._id;
        delete userObj.__v;
        return res.status(201).json(userObj);
      } catch (createError) {
        console.error("Error creating user:", createError);
        return res.status(500).json({ error: "Failed to create user profile" });
      }
    }

    res.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Get all users (admin only)
router.get("/", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    const requestingUser = await User.findOne({ uid: req.user.uid });
    if (!requestingUser || requestingUser.role !== "admin") {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { page = 1, limit = 10, role, year, section, branch } = req.query;
    const query = {};

    // Build query filters
    if (role) query.role = role;
    if (year) query.year = year;
    if (section) query.section = section;
    if (branch) query.branch = branch;

    const users = await User.find(query)
      .select("-_id -__v")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

// Delete user (admin only)
router.delete("/:uid", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    const requestingUser = await User.findOne({ uid: req.user.uid });
    if (!requestingUser || requestingUser.role !== "admin") {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // Don't allow deletion of admin users
    const userToDelete = await User.findOne({ uid: req.params.uid });
    if (!userToDelete) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userToDelete.role === "admin") {
      return res.status(403).json({ error: "Cannot delete admin user" });
    }

    // Delete from Firebase
    await admin.auth().deleteUser(req.params.uid);

    // Delete from MongoDB
    await User.deleteOne({ uid: req.params.uid });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
