const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
    club_id: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Technical', 'Cultural', 'Sports', 'Literary', 'Social', 'Professional', 'Hobby', 'Other']
    },
    foundedYear: {
        type: Number
    },
    logo: {
        type: String  // URL to club logo
    },
    coverImage: {
        type: String  // URL to cover image
    },
    president: {
        name: String,
        email: String,
        phone: String
    },
    faculty_advisor: {
        name: String,
        email: String,
        department: String
    },
    memberCount: {
        type: Number,
        default: 0
    },
    joinedStudents: [{
        type: String  // stores collegeId of joined students
    }],
    maxMembers: {
        type: Number,
        default: 0  // 0 means unlimited
    },
    meetingSchedule: {
        type: String  // e.g., "Every Saturday, 3 PM"
    },
    venue: {
        type: String
    },
    achievements: [{
        type: String
    }],
    upcomingEvents: [{
        title: String,
        date: Date,
        description: String
    }],
    socialLinks: {
        instagram: String,
        linkedin: String,
        twitter: String,
        website: String
    },
    recruitmentStatus: {
        type: String,
        enum: ['Open', 'Closed', 'Coming Soon'],
        default: 'Open'
    },
    recruitmentDeadline: {
        type: Date
    },
    eligibility: {
        type: String,
        default: 'All Students'
    },
    membershipFee: {
        type: String,
        default: 'Free'
    },
    tags: [{
        type: String
    }],
    featured: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'On Hold'],
        default: 'Active'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
clubSchema.index({ status: 1, category: 1 });
clubSchema.index({ club_id: 1 });
clubSchema.index({ name: 'text', description: 'text' });

// Method to check if recruitment is open
clubSchema.methods.isRecruitmentOpen = function () {
    if (this.recruitmentStatus !== 'Open') return false;
    if (this.recruitmentDeadline && new Date() > this.recruitmentDeadline) return false;
    if (this.maxMembers > 0 && this.memberCount >= this.maxMembers) return false;
    return true;
};

module.exports = mongoose.model('Club', clubSchema);
