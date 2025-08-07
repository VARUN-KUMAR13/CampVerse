const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const User = require("../models/User");

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

/**
 * Generate JWT token for user
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      uid: user.uid,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Middleware to authenticate requests using JWT or Firebase tokens
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    try {
      // Try JWT first
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        return res.status(401).json({ message: "User not found or inactive" });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      req.user = user;
      req.token = token;
      next();
    } catch (jwtError) {
      // If JWT fails, try Firebase token
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const user = await User.findOne({ uid: decodedToken.uid });

        if (!user || !user.isActive) {
          return res.status(401).json({ message: "User not found or inactive" });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        req.user = user;
        req.firebaseUser = decodedToken;
        next();
      } catch (firebaseError) {
        console.error("Token verification failed:", firebaseError);
        return res.status(401).json({ message: "Invalid token" });
      }
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};

/**
 * Middleware to authorize specific roles
 */
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource or is admin
 */
const authorizeOwnerOrAdmin = (userIdField = "userId") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField];

    if (req.user.role === "admin" || req.user._id.toString() === resourceUserId) {
      next();
    } else {
      res.status(403).json({ message: "Access denied. You can only access your own resources." });
    }
  };
};

/**
 * Middleware for admin-only routes
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

/**
 * Middleware for faculty and admin routes
 */
const facultyOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!["faculty", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Faculty or admin access required" });
  }

  next();
};

/**
 * Middleware for student-only routes
 */
const studentOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Student access required" });
  }

  next();
};

/**
 * Middleware to validate branch access for faculty
 * Faculty can only access students from their branch
 */
const validateBranchAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Admin has access to all branches
  if (req.user.role === "admin") {
    return next();
  }

  // For faculty, check if they're accessing their own branch
  if (req.user.role === "faculty") {
    const targetUserId = req.params.userId || req.params.studentId;
    
    if (targetUserId) {
      const targetUser = await User.findById(targetUserId);
      
      if (targetUser && targetUser.branch !== req.user.branch) {
        return res.status(403).json({
          message: "Access denied. You can only access students from your branch.",
        });
      }
    }
  }

  next();
};

/**
 * Rate limiting middleware
 */
const rateLimiter = (maxRequests = 100, timeWindow = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const identifier = req.ip + (req.user ? req.user._id : '');
    const now = Date.now();

    if (!requests.has(identifier)) {
      requests.set(identifier, { count: 1, resetTime: now + timeWindow });
      return next();
    }

    const requestData = requests.get(identifier);

    if (now > requestData.resetTime) {
      requestData.count = 1;
      requestData.resetTime = now + timeWindow;
      return next();
    }

    if (requestData.count >= maxRequests) {
      return res.status(429).json({
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((requestData.resetTime - now) / 1000),
      });
    }

    requestData.count++;
    next();
  };
};

/**
 * Middleware to log user activities
 */
const logActivity = (action) => {
  return (req, res, next) => {
    if (req.user) {
      console.log(`[${new Date().toISOString()}] User ${req.user.collegeId} (${req.user.role}) performed: ${action}`);
      
      // Here you could save to an activity log in database
      // const ActivityLog = require('../models/ActivityLog');
      // new ActivityLog({
      //   userId: req.user._id,
      //   action,
      //   ip: req.ip,
      //   userAgent: req.get('User-Agent'),
      //   timestamp: new Date()
      // }).save();
    }
    next();
  };
};

/**
 * Middleware to validate API version
 */
const validateApiVersion = (supportedVersions = ['v1']) => {
  return (req, res, next) => {
    const version = req.headers['api-version'] || 'v1';
    
    if (!supportedVersions.includes(version)) {
      return res.status(400).json({
        message: `Unsupported API version. Supported versions: ${supportedVersions.join(', ')}`,
      });
    }
    
    req.apiVersion = version;
    next();
  };
};

/**
 * Middleware to handle CORS for specific routes
 */
const corsHandler = (origins = ['http://localhost:3000']) => {
  return (req, res, next) => {
    const origin = req.headers.origin;
    
    if (origins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, api-version');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    next();
  };
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  authorizeRoles,
  authorizeOwnerOrAdmin,
  adminOnly,
  facultyOrAdmin,
  studentOnly,
  validateBranchAccess,
  rateLimiter,
  logActivity,
  validateApiVersion,
  corsHandler,
};
