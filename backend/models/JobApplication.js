const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlacementJob",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Selected", "Rejected", "Withdrawn"],
      default: "Applied",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    documents: [
      {
        type: {
          type: String,
          enum: ["Resume", "Cover Letter", "Transcript", "Portfolio", "Other"],
          required: true,
        },
        filename: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        uploadDate: {
          type: Date,
          default: Date.now,
        },
        size: Number, // File size in bytes
        mimeType: String,
      },
    ],
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    studentResponses: [
      {
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    interviewSlots: [
      {
        round: {
          type: String,
          required: true,
        },
        scheduledDate: Date,
        scheduledTime: String,
        location: String,
        interviewerName: String,
        interviewerEmail: String,
        meetingLink: String,
        status: {
          type: String,
          enum: ["Scheduled", "Completed", "Cancelled", "Rescheduled"],
          default: "Scheduled",
        },
        feedback: String,
        score: Number,
      },
    ],
    finalFeedback: {
      overallScore: Number,
      strengths: [String],
      areasForImprovement: [String],
      recommendation: {
        type: String,
        enum: ["Strongly Recommend", "Recommend", "Neutral", "Not Recommend"],
      },
      comments: String,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reviewDate: Date,
    },
    offerDetails: {
      offered: {
        type: Boolean,
        default: false,
      },
      ctc: String,
      joiningDate: Date,
      location: String,
      bondPeriod: String,
      offerLetter: {
        filename: String,
        url: String,
        uploadDate: Date,
      },
      accepted: Boolean,
      acceptanceDate: Date,
      rejectionReason: String,
    },
    timeline: [
      {
        action: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        details: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUpdatedBy: {
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

// Compound indexes for performance
jobApplicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });
jobApplicationSchema.index({ studentId: 1, status: 1 });
jobApplicationSchema.index({ jobId: 1, status: 1 });
jobApplicationSchema.index({ appliedDate: -1 });

// Virtual for job details
jobApplicationSchema.virtual("job", {
  ref: "PlacementJob",
  localField: "jobId",
  foreignField: "_id",
  justOne: true,
});

// Virtual for student details
jobApplicationSchema.virtual("student", {
  ref: "User",
  localField: "studentId",
  foreignField: "_id",
  justOne: true,
});

// Virtual for days since application
jobApplicationSchema.virtual("daysSinceApplication").get(function () {
  const now = new Date();
  const applied = new Date(this.appliedDate);
  const diffTime = now - applied;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for current interview status
jobApplicationSchema.virtual("currentInterviewStatus").get(function () {
  if (!this.interviewSlots || this.interviewSlots.length === 0) {
    return "No interviews scheduled";
  }
  
  const latestSlot = this.interviewSlots[this.interviewSlots.length - 1];
  return `${latestSlot.round}: ${latestSlot.status}`;
});

// Pre-save middleware
jobApplicationSchema.pre("save", function (next) {
  // Add timeline entry for status changes
  if (this.isModified("status") && !this.isNew) {
    this.timeline.push({
      action: `Status changed to ${this.status}`,
      performedBy: this.lastUpdatedBy,
    });
  }
  
  // Add timeline entry for new application
  if (this.isNew) {
    this.timeline.push({
      action: "Application submitted",
      performedBy: this.studentId,
    });
  }
  
  next();
});

// Post-save middleware to update job application counts
jobApplicationSchema.post("save", async function (doc) {
  const PlacementJob = mongoose.model("PlacementJob");
  const job = await PlacementJob.findById(doc.jobId);
  if (job) {
    await job.updateApplicationCounts();
  }
});

// Post-remove middleware to update job application counts
jobApplicationSchema.post("deleteOne", { document: true }, async function (doc) {
  const PlacementJob = mongoose.model("PlacementJob");
  const job = await PlacementJob.findById(doc.jobId);
  if (job) {
    await job.updateApplicationCounts();
  }
});

// Instance methods
jobApplicationSchema.methods.addDocument = function (documentData) {
  this.documents.push(documentData);
  this.timeline.push({
    action: `Document uploaded: ${documentData.type}`,
    performedBy: this.studentId,
  });
  return this.save();
};

jobApplicationSchema.methods.scheduleInterview = function (interviewData, scheduledBy) {
  this.interviewSlots.push(interviewData);
  this.timeline.push({
    action: `Interview scheduled for ${interviewData.round}`,
    performedBy: scheduledBy,
    details: `Date: ${interviewData.scheduledDate}, Time: ${interviewData.scheduledTime}`,
  });
  
  // Update status if first interview
  if (this.status === "Applied") {
    this.status = "Shortlisted";
  }
  
  return this.save();
};

jobApplicationSchema.methods.updateInterviewStatus = function (slotIndex, status, feedback, score, updatedBy) {
  if (this.interviewSlots[slotIndex]) {
    this.interviewSlots[slotIndex].status = status;
    if (feedback) this.interviewSlots[slotIndex].feedback = feedback;
    if (score !== undefined) this.interviewSlots[slotIndex].score = score;
    
    this.timeline.push({
      action: `Interview ${status.toLowerCase()}: ${this.interviewSlots[slotIndex].round}`,
      performedBy: updatedBy,
      details: feedback,
    });
  }
  
  return this.save();
};

jobApplicationSchema.methods.makeOffer = function (offerData, offeredBy) {
  this.offerDetails = {
    ...offerData,
    offered: true,
  };
  
  this.status = "Selected";
  
  this.timeline.push({
    action: "Offer made",
    performedBy: offeredBy,
    details: `CTC: ${offerData.ctc}, Joining: ${offerData.joiningDate}`,
  });
  
  return this.save();
};

jobApplicationSchema.methods.acceptOffer = function () {
  this.offerDetails.accepted = true;
  this.offerDetails.acceptanceDate = new Date();
  
  this.timeline.push({
    action: "Offer accepted",
    performedBy: this.studentId,
  });
  
  return this.save();
};

jobApplicationSchema.methods.rejectOffer = function (reason) {
  this.offerDetails.accepted = false;
  this.offerDetails.rejectionReason = reason;
  
  this.timeline.push({
    action: "Offer rejected",
    performedBy: this.studentId,
    details: reason,
  });
  
  return this.save();
};

jobApplicationSchema.methods.withdraw = function () {
  this.status = "Withdrawn";
  this.isActive = false;
  
  this.timeline.push({
    action: "Application withdrawn",
    performedBy: this.studentId,
  });
  
  return this.save();
};

// Static methods
jobApplicationSchema.statics.getApplicationsByStudent = function (studentId) {
  return this.find({ studentId, isActive: true })
    .populate("jobId")
    .sort({ appliedDate: -1 });
};

jobApplicationSchema.statics.getApplicationsByJob = function (jobId) {
  return this.find({ jobId, isActive: true })
    .populate("studentId")
    .sort({ appliedDate: -1 });
};

jobApplicationSchema.statics.getApplicationsByStatus = function (status, jobId = null) {
  const query = { status, isActive: true };
  if (jobId) query.jobId = jobId;
  
  return this.find(query)
    .populate("jobId studentId")
    .sort({ appliedDate: -1 });
};

jobApplicationSchema.statics.getApplicationStats = function (jobId = null) {
  const matchStage = { isActive: true };
  if (jobId) matchStage.jobId = jobId;
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$count" },
        statuses: {
          $push: {
            status: "$_id",
            count: "$count",
          },
        },
      },
    },
  ]);
};

jobApplicationSchema.statics.hasUserApplied = function (studentId, jobId) {
  return this.findOne({ studentId, jobId, isActive: true });
};

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
