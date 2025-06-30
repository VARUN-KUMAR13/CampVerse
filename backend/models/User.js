const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    collegeId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      validate: {
        validator: function (v) {
          // Admin exception
          if (v === "ADMIN") return true;
          // College ID pattern: YYBBBSBBR (e.g., 22B81A05C3)
          return /^[0-9]{2}[A-Z0-9]{3}[A-Z][0-9]{2}[A-Z0-9]{1,2}$/.test(v);
        },
        message: "Invalid college ID format",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@cvr\.ac\.in$/.test(v);
        },
        message: "Email must be from @cvr.ac.in domain",
      },
    },
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      required: true,
    },
    year: {
      type: String,
      required: function () {
        return this.role !== "admin";
      },
    },
    section: {
      type: String,
      required: function () {
        return this.role !== "admin";
      },
      validate: {
        validator: function (v) {
          if (this.role === "admin") return true;
          if (this.role === "faculty") return v === "Z";
          return /^[A-F]$/.test(v); // Students: A-F, Faculty: Z
        },
        message: "Invalid section",
      },
    },
    branch: {
      type: String,
      required: function () {
        return this.role !== "admin";
      },
      validate: {
        validator: function (v) {
          if (this.role === "admin") return true;
          return /^[0-9]{2}$/.test(v);
        },
        message: "Branch must be 2 digits",
      },
    },
    rollNumber: {
      type: String,
      required: function () {
        return this.role !== "admin";
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
userSchema.index({ collegeId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ year: 1, section: 1, branch: 1 });

// Virtual for full branch info
userSchema.virtual("branchInfo").get(function () {
  const branchCodes = {
    "01": "Civil Engineering",
    "02": "Mechanical Engineering",
    "03": "Electrical Engineering",
    "04": "Electronics and Communication",
    "05": "Computer Science and Engineering",
    "06": "Information Technology",
    "07": "Chemical Engineering",
    "08": "Aeronautical Engineering",
    "09": "Biotechnology",
    10: "Data Science",
  };
  return branchCodes[this.branch] || "Unknown Branch";
});

// Virtual for academic year
userSchema.virtual("academicYear").get(function () {
  if (this.role === "admin") return null;
  const currentYear = new Date().getFullYear();
  const joinYear = parseInt("20" + this.year);
  const yearDiff = currentYear - joinYear;

  if (yearDiff < 1) return "1st Year";
  if (yearDiff < 2) return "2nd Year";
  if (yearDiff < 3) return "3rd Year";
  if (yearDiff < 4) return "4th Year";
  return "Alumni";
});

// Pre-save middleware to update timestamps
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
