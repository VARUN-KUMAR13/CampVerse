const mongoose = require("mongoose");

const learningMilestoneSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ["dsa", "programming", "academics", "career", "soft_skills", "other"],
        default: "other",
    },
    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
    },
    achievedAt: {
        type: Date,
        default: Date.now,
    },
    notes: String,
});

const interactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    topic: String,
    category: String,
    questionsAsked: {
        type: Number,
        default: 0,
    },
    helpfulResponses: {
        type: Number,
        default: 0,
    },
});

const studentGrowthSchema = new mongoose.Schema(
    {
        // Student identification
        userId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        rollNumber: {
            type: String,
            index: true,
        },
        // Student profile
        profile: {
            name: String,
            department: String,
            year: String,
            semester: Number,
            joiningDate: Date,
        },
        // Learning progress tracking
        learningProgress: {
            // DSA Progress
            dsa: {
                level: {
                    type: String,
                    enum: ["beginner", "intermediate", "advanced"],
                    default: "beginner",
                },
                topicsExplored: [String],
                problemsSolved: { type: Number, default: 0 },
                lastActive: Date,
            },
            // Programming Progress
            programming: {
                languages: [
                    {
                        name: String,
                        proficiency: {
                            type: String,
                            enum: ["beginner", "intermediate", "advanced"],
                        },
                        projectsBuilt: { type: Number, default: 0 },
                    },
                ],
                lastActive: Date,
            },
            // Academic Progress
            academics: {
                subjectsExplored: [String],
                questionsAsked: { type: Number, default: 0 },
                lastActive: Date,
            },
            // Career Preparation
            career: {
                resumeReviewed: { type: Boolean, default: false },
                interviewPrepStarted: { type: Boolean, default: false },
                companiesExplored: [String],
                lastActive: Date,
            },
        },
        // Milestones achieved
        milestones: [learningMilestoneSchema],
        // Interaction history summary
        interactionSummary: {
            totalConversations: { type: Number, default: 0 },
            totalQuestions: { type: Number, default: 0 },
            topTopics: [
                {
                    topic: String,
                    count: Number,
                },
            ],
            weeklyInteractions: [interactionSchema],
            lastInteraction: Date,
        },
        // AI-generated insights
        insights: {
            strengths: [String],
            areasToImprove: [String],
            recommendations: [String],
            lastUpdated: Date,
        },
        // Goals set by student
        goals: [
            {
                title: String,
                description: String,
                category: String,
                targetDate: Date,
                completed: { type: Boolean, default: false },
                completedAt: Date,
                createdAt: { type: Date, default: Date.now },
            },
        ],
        // Engagement metrics
        engagement: {
            streakDays: { type: Number, default: 0 },
            longestStreak: { type: Number, default: 0 },
            lastActiveDate: Date,
            totalActiveMinutes: { type: Number, default: 0 },
        },
    },
    {
        timestamps: true,
    }
);

// Method to update learning progress
studentGrowthSchema.methods.updateProgress = function (category, data) {
    if (this.learningProgress[category]) {
        Object.assign(this.learningProgress[category], data);
        this.learningProgress[category].lastActive = new Date();
    }
    return this.save();
};

// Method to add milestone
studentGrowthSchema.methods.addMilestone = function (milestone) {
    this.milestones.push(milestone);
    return this.save();
};

// Method to record interaction
studentGrowthSchema.methods.recordInteraction = function (topic, category) {
    this.interactionSummary.totalQuestions += 1;
    this.interactionSummary.lastInteraction = new Date();

    // Update top topics
    const existingTopic = this.interactionSummary.topTopics.find(
        (t) => t.topic === topic
    );
    if (existingTopic) {
        existingTopic.count += 1;
    } else {
        this.interactionSummary.topTopics.push({ topic, count: 1 });
    }

    // Sort and keep top 10
    this.interactionSummary.topTopics.sort((a, b) => b.count - a.count);
    this.interactionSummary.topTopics = this.interactionSummary.topTopics.slice(
        0,
        10
    );

    // Update streak
    const today = new Date().toDateString();
    const lastActive = this.engagement.lastActiveDate
        ? new Date(this.engagement.lastActiveDate).toDateString()
        : null;

    if (lastActive !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (lastActive === yesterday) {
            this.engagement.streakDays += 1;
            if (this.engagement.streakDays > this.engagement.longestStreak) {
                this.engagement.longestStreak = this.engagement.streakDays;
            }
        } else if (lastActive !== today) {
            this.engagement.streakDays = 1;
        }
        this.engagement.lastActiveDate = new Date();
    }

    return this.save();
};

// Static method to get or create student growth record
studentGrowthSchema.statics.getOrCreate = async function (
    userId,
    rollNumber,
    profile
) {
    let record = await this.findOne({ userId });

    if (!record) {
        record = new this({
            userId,
            rollNumber,
            profile,
        });
        await record.save();
    }

    return record;
};

// Static method to get growth summary
studentGrowthSchema.statics.getGrowthSummary = async function (userId) {
    const record = await this.findOne({ userId });
    if (!record) return null;

    return {
        profile: record.profile,
        progress: {
            dsa: record.learningProgress.dsa.level,
            programmingLanguages: record.learningProgress.programming.languages.length,
            careerPrepStarted: record.learningProgress.career.interviewPrepStarted,
        },
        milestones: record.milestones.length,
        streak: record.engagement.streakDays,
        insights: record.insights,
    };
};

module.exports = mongoose.model("StudentGrowth", studentGrowthSchema);
