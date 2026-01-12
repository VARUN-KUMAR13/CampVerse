const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    event_id: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    title: {
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
        enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Other']
    },
    date: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    venue: {
        type: String,
        required: true
    },
    organizer: {
        type: String,
        required: true
    },
    entryFee: {
        type: String,
        default: 'Free'
    },
    maxParticipants: {
        type: Number,
        default: 0  // 0 means unlimited
    },
    registeredParticipants: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Open', 'Closed', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
        default: 'Open'
    },
    featured: {
        type: Boolean,
        default: false
    },
    highlights: [{
        type: String
    }],
    prizes: {
        type: String
    },
    registrationDeadline: {
        type: Date
    },
    targetAudience: {
        type: String,
        enum: ['All', 'Students', 'Faculty', 'Specific'],
        default: 'All'
    },
    eligibleBranches: [{
        type: String
    }],
    contactEmail: {
        type: String
    },
    contactPhone: {
        type: String
    },
    websiteLink: {
        type: String
    },
    attachments: [{
        filename: String,
        url: String
    }],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ event_id: 1 });

// Method to check if registration is open
eventSchema.methods.isRegistrationOpen = function () {
    if (this.status !== 'Open') return false;
    if (this.registrationDeadline && new Date() > this.registrationDeadline) return false;
    if (this.maxParticipants > 0 && this.registeredParticipants >= this.maxParticipants) return false;
    return true;
};

// Method to increment view count
eventSchema.methods.incrementViewCount = async function () {
    this.viewCount += 1;
    return this.save();
};

module.exports = mongoose.model('Event', eventSchema);
