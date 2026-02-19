const mongoose = require("mongoose");

const placementJobSchema = new mongoose.Schema(
  {
    job_id: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      validate: {
        validator: function (v) {
          // Format: COMPANY-YEAR (e.g., TCS2025, WIPRO2025)
          return /^[A-Z0-9]+[0-9]{4}$/.test(v);
        },
        message: "Job ID must be in format: COMPANY-YEAR (e.g., TCS2025)",
      },
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      required: true,
      enum: ["Full Time", "Internship", "Intern + Full Time", "Contract"],
    },
    ctc: {
      type: String,
      required: true,
      trim: true,
    },
    stipend: {
      type: String,
      trim: true,
    },
    deadline: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v > new Date();
        },
        message: "Deadline must be in the future",
      },
    },
    status: {
      type: String,
      enum: ["Open", "Closed", "Draft"],
      default: "Draft",
    },
    eligibility: [
      {
        type: String,
        required: true,
        enum: [
          "All Branches",
          "CSE",
          "IT",
          "ECE",
          "EEE",
          "MECH",
          "CIVIL",
          "CHEM",
          "AERO",
          "BIOTECH",
          "DS",
        ],
      },
    ],
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    bond: {
      type: String,
      trim: true,
    },
    rounds: [
      {
        type: String,
        trim: true,
      },
    ],
    attachments: [
      {
        filename: String,
        url: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    appliedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shortlistedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    selectedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    applicationInstructions: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    benefits: [
      {
        type: String,
        trim: true,
      },
    ],
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Invalid email format",
      },
    },
    contactPhone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^[+]?[0-9]{10,15}$/.test(v.replace(/\s/g, ""));
        },
        message: "Invalid phone number format",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
placementJobSchema.index({ job_id: 1 });
placementJobSchema.index({ company: 1 });
placementJobSchema.index({ status: 1 });
placementJobSchema.index({ deadline: 1 });
placementJobSchema.index({ eligibility: 1 });
placementJobSchema.index({ postedBy: 1 });
placementJobSchema.index({ createdAt: -1 });

// Virtual for applications
placementJobSchema.virtual("applications", {
  ref: "JobApplication",
  localField: "_id",
  foreignField: "jobId",
});

// Virtual for days until deadline
placementJobSchema.virtual("daysUntilDeadline").get(function () {
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for formatted deadline
placementJobSchema.virtual("formattedDeadline").get(function () {
  return this.deadline.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Pre-save middleware
placementJobSchema.pre("save", function (next) {
  // Ensure job_id is uppercase
  if (this.job_id) {
    this.job_id = this.job_id.toUpperCase();
  }

  // Auto-close job if deadline has passed
  if (this.deadline <= new Date() && this.status === "Open") {
    this.status = "Closed";
  }

  next();
});

// Instance methods
placementJobSchema.methods.canUserApply = function (user) {
  // Check if job is open
  if (this.status !== "Open") return false;

  // Check if deadline has passed
  if (this.deadline <= new Date()) return false;

  // Admin can apply to any job
  if (user.role === "admin") return true;

  // Check if user is a student
  if (user.role !== "student") return false;

  // Check eligibility criteria
  if (this.eligibility.includes("All Branches")) return true;

  // Check if user's branch is in eligibility list
  const branchMap = {
    "05": "CSE",
    "06": "IT",
    "04": "ECE",
    "03": "EEE",
    "02": "MECH",
    "01": "CIVIL",
    "07": "CHEM",
    "08": "AERO",
    "09": "BIOTECH",
    "10": "DS",
  };

  const userBranch = branchMap[user.branch];
  return this.eligibility.includes(userBranch);
};

placementJobSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this.save();
};

placementJobSchema.methods.updateApplicationCounts = async function () {
  const JobApplication = mongoose.model("JobApplication");

  const counts = await JobApplication.aggregate([
    { $match: { jobId: this._id } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Reset counts
  this.appliedCount = 0;
  this.shortlistedCount = 0;
  this.selectedCount = 0;

  // Update counts based on aggregation
  counts.forEach((item) => {
    switch (item._id) {
      case "Applied":
        this.appliedCount = item.count;
        break;
      case "Shortlisted":
        this.shortlistedCount = item.count;
        break;
      case "Selected":
        this.selectedCount = item.count;
        break;
    }
  });

  return this.save();
};

// Static methods
placementJobSchema.statics.getActiveJobs = function () {
  return this.find({
    status: "Open",
    deadline: { $gte: new Date() },
    isActive: true,
  }).sort({ createdAt: -1 });
};

placementJobSchema.statics.getJobsByEligibility = function (userBranch) {
  const query = {
    status: "Open",
    deadline: { $gte: new Date() },
    isActive: true,
    $or: [
      { eligibility: "All Branches" },
      { eligibility: userBranch },
    ],
  };

  return this.find(query).sort({ createdAt: -1 });
};

placementJobSchema.statics.getJobsPostedBy = function (userId) {
  return this.find({ postedBy: userId }).sort({ createdAt: -1 });
};

placementJobSchema.statics.getPopularJobs = function (limit = 10) {
  return this.find({
    status: "Open",
    deadline: { $gte: new Date() },
    isActive: true,
  })
    .sort({ appliedCount: -1, viewCount: -1 })
    .limit(limit);
};

// Middleware to update application counts after job application changes
placementJobSchema.post("save", async function (doc) {
  // Update counts when job is saved
  if (doc.isModified("appliedCount") || doc.isModified("shortlistedCount") || doc.isModified("selectedCount")) {
    return; // Avoid infinite loop
  }
});

module.exports = mongoose.model("PlacementJob", placementJobSchema);
