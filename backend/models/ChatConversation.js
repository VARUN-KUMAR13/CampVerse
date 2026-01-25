const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    isBot: {
        type: Boolean,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    metadata: {
        intent: String,
        confidence: Number,
        navigationTarget: String,
        suggestions: [
            {
                id: String,
                text: String,
            },
        ],
    },
});

const chatConversationSchema = new mongoose.Schema(
    {
        // User identification (can be null for guests)
        userId: {
            type: String,
            index: true,
        },
        // Session ID for guests or additional tracking
        sessionId: {
            type: String,
            required: true,
            index: true,
        },
        // User role for context-aware responses
        userRole: {
            type: String,
            enum: ["student", "faculty", "admin", "guest"],
            default: "guest",
        },
        // User details for personalization
        userDetails: {
            name: String,
            rollNumber: String,
            department: String,
            year: String,
        },
        // Conversation messages
        messages: [messageSchema],
        // Conversation metadata
        metadata: {
            startedAt: {
                type: Date,
                default: Date.now,
            },
            lastActiveAt: {
                type: Date,
                default: Date.now,
            },
            totalMessages: {
                type: Number,
                default: 0,
            },
            topics: [String],
            resolved: {
                type: Boolean,
                default: false,
            },
            satisfaction: {
                type: Number,
                min: 1,
                max: 5,
            },
        },
        // Active status
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
chatConversationSchema.index({ userId: 1, createdAt: -1 });
chatConversationSchema.index({ sessionId: 1, isActive: 1 });

// Method to add a message
chatConversationSchema.methods.addMessage = function (message) {
    this.messages.push(message);
    this.metadata.totalMessages = this.messages.length;
    this.metadata.lastActiveAt = new Date();
    return this.save();
};

// Static method to get recent conversations for a user
chatConversationSchema.statics.getRecentConversations = function (
    userId,
    limit = 10
) {
    return this.find({ userId })
        .sort({ "metadata.lastActiveAt": -1 })
        .limit(limit)
        .select("metadata messages.content messages.isBot createdAt");
};

// Static method to get or create active conversation
chatConversationSchema.statics.getOrCreateConversation = async function (
    userId,
    sessionId,
    userRole,
    userDetails
) {
    let conversation = await this.findOne({
        sessionId,
        isActive: true,
    });

    if (!conversation) {
        conversation = new this({
            userId,
            sessionId,
            userRole,
            userDetails,
        });
        await conversation.save();
    }

    return conversation;
};

module.exports = mongoose.model("ChatConversation", chatConversationSchema);
