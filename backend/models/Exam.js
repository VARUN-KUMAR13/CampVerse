const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    exam_id: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    course: {
        type: String,
        required: true,
        trim: true,
    },
    courseCode: {
        type: String,
        trim: true,
    },
    examType: {
        type: String,
        enum: ['Mid-Term', 'End-Term', 'Quiz', 'Practical', 'Viva', 'Assignment', 'Other'],
        default: 'Mid-Term',
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
    },
    venue: {
        type: String,
        trim: true,
    },
    maxMarks: {
        type: Number,
        default: 100,
    },
    passingMarks: {
        type: Number,
    },
    description: {
        type: String,
        trim: true,
    },
    instructions: {
        type: String,
        trim: true,
    },
    syllabus: {
        type: String,
        trim: true,
    },
    targetAudience: {
        branches: [{
            type: String,
        }],
        sections: [{
            type: String,
        }],
        years: [{
            type: String,
        }],
        semesters: [{
            type: String,
        }],
    },
    faculty: {
        name: String,
        email: String,
        department: String,
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Ongoing', 'Completed', 'Postponed', 'Cancelled'],
        default: 'Scheduled',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    postedBy: {
        type: String,
        default: 'admin',
    },
});

// Pre-save middleware to update the updatedAt field
examSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Index for efficient queries
examSchema.index({ exam_id: 1 });
examSchema.index({ date: 1 });
examSchema.index({ status: 1 });
examSchema.index({ 'targetAudience.branches': 1 });

module.exports = mongoose.model('Exam', examSchema);
