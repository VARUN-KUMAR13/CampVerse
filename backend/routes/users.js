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

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
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
    const user = await User.findOne({ uid: req.params.uid }).select(
      "-_id -__v",
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update last login
    await user.updateLastLogin();

    res.json(user);
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

// Update user profile (protected route)
router.put("/:uid", verifyToken, async (req, res) => {
  try {
    // Only allow updating certain fields
    const allowedUpdates = ["name"];
    const updates = {};

    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid updates provided" });
    }

    const user = await User.findOneAndUpdate({ uid: req.params.uid }, updates, {
      new: true,
      runValidators: true,
    }).select("-_id -__v");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
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
