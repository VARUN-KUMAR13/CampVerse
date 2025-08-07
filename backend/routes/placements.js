const express = require("express");
const router = express.Router();
const PlacementJob = require("../models/PlacementJob");
const JobApplication = require("../models/JobApplication");
const User = require("../models/User");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/placements/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images and documents are allowed"));
    }
  },
});

// @route   GET /api/placements
// @desc    Get all placement jobs
// @access  Public (authenticated users)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { status, eligibility, company, type, page = 1, limit = 10 } = req.query;
    const user = req.user;

    // Build filter query
    let filter = { isActive: true };

    // Filter by status
    if (status) {
      filter.status = status;
    } else {
      // Default to showing only open jobs for students
      if (user.role === "student") {
        filter.status = "Open";
        filter.deadline = { $gte: new Date() };
      }
    }

    // Filter by eligibility for students
    if (user.role === "student") {
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
      filter.$or = [
        { eligibility: "All Branches" },
        { eligibility: userBranch },
      ];
    }

    // Additional filters
    if (eligibility) filter.eligibility = eligibility;
    if (company) filter.company = new RegExp(company, "i");
    if (type) filter.type = type;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await PlacementJob.find(filter)
      .populate("postedBy", "name collegeId")
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PlacementJob.countDocuments(filter);

    // For students, check if they have applied to each job
    if (user.role === "student") {
      const jobsWithApplicationStatus = await Promise.all(
        jobs.map(async (job) => {
          const application = await JobApplication.findOne({
            jobId: job._id,
            studentId: user._id,
            isActive: true,
          });

          return {
            ...job.toObject(),
            applied: !!application,
            applicationStatus: application ? application.status : null,
            canApply: job.canUserApply(user),
          };
        })
      );

      res.json({
        jobs: jobsWithApplicationStatus,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
        },
      });
    } else {
      res.json({
        jobs,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
        },
      });
    }
  } catch (error) {
    console.error("Error fetching placement jobs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/placements/:id
// @desc    Get single placement job by ID
// @access  Public (authenticated users)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const job = await PlacementJob.findById(req.params.id)
      .populate("postedBy", "name collegeId email");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Increment view count
    await job.incrementViewCount();

    // For students, check application status
    if (req.user.role === "student") {
      const application = await JobApplication.findOne({
        jobId: job._id,
        studentId: req.user._id,
        isActive: true,
      });

      res.json({
        ...job.toObject(),
        applied: !!application,
        applicationStatus: application ? application.status : null,
        canApply: job.canUserApply(req.user),
        application: application || null,
      });
    } else {
      res.json(job);
    }
  } catch (error) {
    console.error("Error fetching placement job:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/placements
// @desc    Create new placement job
// @access  Admin, Faculty
router.post("/", authenticateToken, authorizeRoles(["admin", "faculty"]), async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user._id,
      status: req.body.status || "Draft",
    };

    // Validate required fields
    if (!jobData.job_id || !jobData.title || !jobData.company || !jobData.type || !jobData.ctc || !jobData.deadline) {
      return res.status(400).json({
        message: "Missing required fields: job_id, title, company, type, ctc, deadline",
      });
    }

    // Check if job_id already exists
    const existingJob = await PlacementJob.findOne({ job_id: jobData.job_id });
    if (existingJob) {
      return res.status(400).json({
        message: "Job ID already exists. Please use a unique job ID.",
      });
    }

    const job = new PlacementJob(jobData);
    await job.save();

    await job.populate("postedBy", "name collegeId");

    res.status(201).json({
      message: "Placement job created successfully",
      job,
    });
  } catch (error) {
    console.error("Error creating placement job:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message),
      });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/placements/:id
// @desc    Update placement job
// @access  Admin, Faculty (own jobs only)
router.put("/:id", authenticateToken, authorizeRoles(["admin", "faculty"]), async (req, res) => {
  try {
    const job = await PlacementJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if user can edit this job
    if (req.user.role !== "admin" && !job.postedBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to edit this job" });
    }

    // Update job
    const updatedData = {
      ...req.body,
      lastModifiedBy: req.user._id,
    };

    Object.assign(job, updatedData);
    await job.save();

    await job.populate("postedBy", "name collegeId");

    res.json({
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    console.error("Error updating placement job:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message),
      });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/placements/:id
// @desc    Delete placement job
// @access  Admin only
router.delete("/:id", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
  try {
    const job = await PlacementJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if there are any applications
    const applicationCount = await JobApplication.countDocuments({ jobId: job._id });
    if (applicationCount > 0) {
      return res.status(400).json({
        message: `Cannot delete job with ${applicationCount} applications. Archive it instead.`,
      });
    }

    await PlacementJob.findByIdAndDelete(req.params.id);

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting placement job:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/placements/:id/apply
// @desc    Apply to a placement job
// @access  Students only
router.post("/:id/apply", authenticateToken, authorizeRoles(["student"]), upload.array("documents", 5), async (req, res) => {
  try {
    const job = await PlacementJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if student can apply
    if (!job.canUserApply(req.user)) {
      return res.status(400).json({
        message: "You are not eligible to apply for this job or the deadline has passed",
      });
    }

    // Check if already applied
    const existingApplication = await JobApplication.findOne({
      jobId: job._id,
      studentId: req.user._id,
      isActive: true,
    });

    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    // Process uploaded documents
    const documents = req.files ? req.files.map(file => ({
      type: req.body.documentTypes ? req.body.documentTypes[req.files.indexOf(file)] : "Other",
      filename: file.filename,
      url: `/uploads/placements/${file.filename}`,
      size: file.size,
      mimeType: file.mimetype,
    })) : [];

    // Process student responses if any
    const studentResponses = req.body.responses ? JSON.parse(req.body.responses) : [];

    const applicationData = {
      jobId: job._id,
      studentId: req.user._id,
      documents,
      notes: req.body.notes,
      studentResponses,
    };

    const application = new JobApplication(applicationData);
    await application.save();

    // Update job application count
    await job.updateApplicationCounts();

    await application.populate("studentId", "name collegeId email year section branch");

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Error applying to job:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/placements/:id/applications
// @desc    Get all applications for a job
// @access  Admin, Faculty (own jobs only)
router.get("/:id/applications", authenticateToken, authorizeRoles(["admin", "faculty"]), async (req, res) => {
  try {
    const job = await PlacementJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if user can view applications
    if (req.user.role !== "admin" && !job.postedBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to view applications for this job" });
    }

    const { status, page = 1, limit = 10 } = req.query;

    let filter = { jobId: job._id, isActive: true };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await JobApplication.find(filter)
      .populate("studentId", "name collegeId email year section branch")
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await JobApplication.countDocuments(filter);

    res.json({
      applications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching job applications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/placements/:jobId/applications/:applicationId
// @desc    Update application status
// @access  Admin, Faculty (own jobs only)
router.put("/:jobId/applications/:applicationId", authenticateToken, authorizeRoles(["admin", "faculty"]), async (req, res) => {
  try {
    const job = await PlacementJob.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if user can update applications
    if (req.user.role !== "admin" && !job.postedBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to update applications for this job" });
    }

    const application = await JobApplication.findById(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const { status, feedback, score } = req.body;

    application.status = status;
    application.lastUpdatedBy = req.user._id;

    // Add to final feedback if provided
    if (feedback || score) {
      application.finalFeedback = {
        ...application.finalFeedback,
        comments: feedback,
        overallScore: score,
        reviewedBy: req.user._id,
        reviewDate: new Date(),
      };
    }

    await application.save();

    // Update job application counts
    await job.updateApplicationCounts();

    await application.populate("studentId", "name collegeId email");

    res.json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/placements/student/applications
// @desc    Get current student's applications
// @access  Students only
router.get("/student/applications", authenticateToken, authorizeRoles(["student"]), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let filter = { studentId: req.user._id, isActive: true };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await JobApplication.find(filter)
      .populate("jobId")
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await JobApplication.countDocuments(filter);

    res.json({
      applications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching student applications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/placements/stats
// @desc    Get placement statistics
// @access  Admin, Faculty
router.get("/stats", authenticateToken, authorizeRoles(["admin", "faculty"]), async (req, res) => {
  try {
    const totalJobs = await PlacementJob.countDocuments({ isActive: true });
    const activeJobs = await PlacementJob.countDocuments({ status: "Open", isActive: true });
    const totalApplications = await JobApplication.countDocuments({ isActive: true });

    const applicationStats = await JobApplication.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const companyStats = await PlacementJob.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$company",
          jobCount: { $sum: 1 },
          totalApplications: { $sum: "$appliedCount" },
        },
      },
      { $sort: { jobCount: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      overview: {
        totalJobs,
        activeJobs,
        totalApplications,
      },
      applicationsByStatus: applicationStats,
      topCompanies: companyStats,
    });
  } catch (error) {
    console.error("Error fetching placement stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
