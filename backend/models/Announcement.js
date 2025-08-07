const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    type: {
      type: String,
      required: true,
      enum: ["General", "Academic", "Event", "Emergency", "Placement", "Examination"],
    },
    targetAudience: [
      {
        type: String,
        required: true,
        enum: [
          "All",
          "Students",
          "Faculty",
          "Admin",
          "1st Year",
          "2nd Year", 
          "3rd Year",
          "4th Year",
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
          "Section A",
          "Section B",
          "Section C",
          "Section D",
          "Section E",
          "Section F",
        ],
      },
    ],
    priority: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    expiryDate: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v > new Date();
        },
        message: "Expiry date must be in the future",
      },
    },
    attachments: [
      {
        filename: {
          type: String,
          required: true,
        },
        originalName: String,
        url: {
          type: String,
          required: true,
        },
        size: Number,
        mimeType: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    actionRequired: {
      type: Boolean,
      default: false,
    },
    actionDeadline: Date,
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
announcementSchema.index({ type: 1 });
announcementSchema.index({ priority: 1 });
announcementSchema.index({ targetAudience: 1 });
announcementSchema.index({ postedBy: 1 });
announcementSchema.index({ publishDate: -1 });
announcementSchema.index({ expiryDate: 1 });
announcementSchema.index({ status: 1 });
announcementSchema.index({ isPinned: -1, publishDate: -1 });
announcementSchema.index({ tags: 1 });

// Virtual for days until expiry
announcementSchema.virtual("daysUntilExpiry").get(function () {
  if (!this.expiryDate) return null;
  
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for read count
announcementSchema.virtual("readCount").get(function () {
  return this.readBy ? this.readBy.length : 0;
});

// Virtual for formatted publish date
announcementSchema.virtual("formattedPublishDate").get(function () {
  return this.publishDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Virtual for urgency level
announcementSchema.virtual("urgencyLevel").get(function () {
  if (this.priority === "Critical") return 4;
  if (this.priority === "High") return 3;
  if (this.priority === "Medium") return 2;
  return 1;
});

// Virtual for poster details
announcementSchema.virtual("poster", {
  ref: "User",
  localField: "postedBy",
  foreignField: "_id",
  justOne: true,
});

// Pre-save middleware
announcementSchema.pre("save", function (next) {
  // Auto-expire announcements
  if (this.expiryDate && this.expiryDate <= new Date() && this.status === "Published") {
    this.status = "Archived";
    this.isActive = false;
  }
  
  // Ensure tags are lowercase and trimmed
  if (this.tags) {
    this.tags = this.tags.map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0);
  }
  
  // Set publish date when status changes to Published
  if (this.isModified("status") && this.status === "Published" && !this.publishDate) {
    this.publishDate = new Date();
  }
  
  next();
});

// Instance methods
announcementSchema.methods.markAsRead = function (userId) {
  // Check if user has already read this announcement
  const existingRead = this.readBy.find(read => read.userId.equals(userId));
  
  if (!existingRead) {
    this.readBy.push({ userId });
    return this.save();
  }
  
  return Promise.resolve(this);
};

announcementSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this.save();
};

announcementSchema.methods.isVisibleToUser = function (user) {
  // Check if announcement is active and published
  if (!this.isActive || this.status !== "Published") return false;
  
  // Check if announcement has expired
  if (this.expiryDate && this.expiryDate <= new Date()) return false;
  
  // Check target audience
  if (this.targetAudience.includes("All")) return true;
  
  // Check by role
  if (this.targetAudience.includes("Students") && user.role === "student") return true;
  if (this.targetAudience.includes("Faculty") && user.role === "faculty") return true;
  if (this.targetAudience.includes("Admin") && user.role === "admin") return true;
  
  // For students, check additional criteria
  if (user.role === "student") {
    // Check by year
    const yearMap = {
      "22": "4th Year",
      "23": "3rd Year", 
      "24": "2nd Year",
      "25": "1st Year",
    };
    
    const userYear = yearMap[user.year];
    if (userYear && this.targetAudience.includes(userYear)) return true;
    
    // Check by branch
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
    if (userBranch && this.targetAudience.includes(userBranch)) return true;
    
    // Check by section
    const userSection = `Section ${user.section}`;
    if (this.targetAudience.includes(userSection)) return true;
  }
  
  return false;
};

announcementSchema.methods.hasUserRead = function (userId) {
  return this.readBy.some(read => read.userId.equals(userId));
};

announcementSchema.methods.pin = function () {
  this.isPinned = true;
  return this.save();
};

announcementSchema.methods.unpin = function () {
  this.isPinned = false;
  return this.save();
};

announcementSchema.methods.archive = function () {
  this.status = "Archived";
  this.isActive = false;
  return this.save();
};

announcementSchema.methods.publish = function () {
  this.status = "Published";
  this.isActive = true;
  if (!this.publishDate) {
    this.publishDate = new Date();
  }
  return this.save();
};

// Static methods
announcementSchema.statics.getActiveAnnouncements = function () {
  return this.find({
    status: "Published",
    isActive: true,
    $or: [
      { expiryDate: { $gte: new Date() } },
      { expiryDate: null },
    ],
  }).sort({ isPinned: -1, publishDate: -1 });
};

announcementSchema.statics.getAnnouncementsForUser = function (user) {
  return this.find({
    status: "Published",
    isActive: true,
    $or: [
      { expiryDate: { $gte: new Date() } },
      { expiryDate: null },
    ],
  })
    .sort({ isPinned: -1, publishDate: -1 })
    .then(announcements => {
      return announcements.filter(announcement => 
        announcement.isVisibleToUser(user)
      );
    });
};

announcementSchema.statics.getByPriority = function (priority) {
  return this.find({
    priority,
    status: "Published",
    isActive: true,
    $or: [
      { expiryDate: { $gte: new Date() } },
      { expiryDate: null },
    ],
  }).sort({ publishDate: -1 });
};

announcementSchema.statics.getByType = function (type) {
  return this.find({
    type,
    status: "Published",
    isActive: true,
    $or: [
      { expiryDate: { $gte: new Date() } },
      { expiryDate: null },
    ],
  }).sort({ isPinned: -1, publishDate: -1 });
};

announcementSchema.statics.searchAnnouncements = function (query, user = null) {
  const searchRegex = new RegExp(query, "i");
  
  const searchQuery = {
    status: "Published",
    isActive: true,
    $or: [
      { expiryDate: { $gte: new Date() } },
      { expiryDate: null },
    ],
    $and: [
      {
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { tags: searchRegex },
        ],
      },
    ],
  };
  
  return this.find(searchQuery)
    .sort({ isPinned: -1, publishDate: -1 })
    .then(announcements => {
      if (user) {
        return announcements.filter(announcement => 
          announcement.isVisibleToUser(user)
        );
      }
      return announcements;
    });
};

announcementSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({
    status: "Published",
    isActive: true,
    $or: [
      { expiryDate: { $gte: new Date() } },
      { expiryDate: null },
    ],
    "readBy.userId": { $ne: userId },
  });
};

announcementSchema.statics.getAnnouncementStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        activeCount: {
          $sum: {
            $cond: [{ $eq: ["$isActive", true] }, 1, 0],
          },
        },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

module.exports = mongoose.model("Announcement", announcementSchema);
