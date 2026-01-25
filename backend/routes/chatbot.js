const express = require("express");
const router = express.Router();
const ChatConversation = require("../models/ChatConversation");
const StudentGrowth = require("../models/StudentGrowth");
const KnowledgeBase = require("../models/KnowledgeBase");
const {
    generateAIResponse,
    analyzeIntent,
    NAVIGATION_COMMANDS,
} = require("../services/aiService");

/**
 * @route   POST /api/chatbot/message
 * @desc    Send a message and get AI response
 * @access  Public (but tracks authenticated users)
 */
router.post("/message", async (req, res) => {
    try {
        const {
            message,
            sessionId,
            userId,
            userRole = "guest",
            userDetails,
            conversationHistory = [],
        } = req.body;

        if (!message || !sessionId) {
            return res.status(400).json({
                error: "Message and sessionId are required",
            });
        }

        // Get or create conversation
        const conversation = await ChatConversation.getOrCreateConversation(
            userId,
            sessionId,
            userRole,
            userDetails
        );

        // Add user message to conversation
        const userMessage = {
            id: `user_${Date.now()}`,
            content: message,
            isBot: false,
            timestamp: new Date(),
        };
        await conversation.addMessage(userMessage);

        // Search knowledge base for relevant info
        let knowledgeContext = "";
        try {
            const knowledgeResults = await KnowledgeBase.search(message);
            if (knowledgeResults.length > 0) {
                knowledgeContext = knowledgeResults
                    .map((k) => `${k.title}: ${k.content}`)
                    .join("\n");
            }
        } catch (kbError) {
            console.warn("Knowledge base search failed:", kbError.message);
        }

        // Generate AI response
        const aiResult = await generateAIResponse(
            message,
            userRole,
            conversationHistory,
            userDetails,
            knowledgeContext
        );

        // Add bot message to conversation
        const botMessage = {
            id: `bot_${Date.now()}`,
            content: aiResult.content,
            isBot: true,
            timestamp: new Date(),
            metadata: {
                intent: analyzeIntent(message),
                navigationTarget: aiResult.navigationTarget?.path || null,
                suggestions: aiResult.suggestions,
            },
        };
        await conversation.addMessage(botMessage);

        // Track student growth if user is a student
        if (userRole === "student" && userId) {
            try {
                const intent = analyzeIntent(message);
                const growthRecord = await StudentGrowth.getOrCreate(
                    userId,
                    userDetails?.rollNumber,
                    userDetails
                );
                await growthRecord.recordInteraction(message.substring(0, 50), intent);
            } catch (growthError) {
                console.warn("Growth tracking failed:", growthError.message);
            }
        }

        res.json({
            success: true,
            response: {
                content: aiResult.content,
                suggestions: aiResult.suggestions || [],
                navigationTarget: aiResult.navigationTarget || null,
                metadata: aiResult.metadata || {},
            },
            conversationId: conversation._id,
        });
    } catch (error) {
        console.error("Chatbot message error:", error);
        res.status(500).json({
            error: "Failed to process message",
            fallbackResponse: {
                content:
                    "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
                suggestions: [
                    { id: "1", text: "Try again" },
                    { id: "2", text: "Help with navigation" },
                    { id: "3", text: "Contact support" },
                ],
            },
        });
    }
});

/**
 * @route   GET /api/chatbot/history/:sessionId
 * @desc    Get conversation history for a session
 * @access  Public
 */
router.get("/history/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { limit = 50 } = req.query;

        const conversation = await ChatConversation.findOne({
            sessionId,
            isActive: true,
        });

        if (!conversation) {
            return res.json({
                success: true,
                messages: [],
            });
        }

        const messages = conversation.messages.slice(-parseInt(limit));

        res.json({
            success: true,
            messages,
            metadata: conversation.metadata,
        });
    } catch (error) {
        console.error("Get history error:", error);
        res.status(500).json({ error: "Failed to get conversation history" });
    }
});

/**
 * @route   GET /api/chatbot/user-history/:userId
 * @desc    Get all conversations for a user
 * @access  Private (should be authenticated)
 */
router.get("/user-history/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;

        const conversations = await ChatConversation.getRecentConversations(
            userId,
            parseInt(limit)
        );

        res.json({
            success: true,
            conversations,
        });
    } catch (error) {
        console.error("Get user history error:", error);
        res.status(500).json({ error: "Failed to get user history" });
    }
});

/**
 * @route   POST /api/chatbot/feedback
 * @desc    Submit feedback for a conversation
 * @access  Public
 */
router.post("/feedback", async (req, res) => {
    try {
        const { sessionId, messageId, rating, feedback } = req.body;

        const conversation = await ChatConversation.findOne({ sessionId });

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        // Update conversation satisfaction
        conversation.metadata.satisfaction = rating;
        conversation.metadata.resolved = rating >= 3;
        await conversation.save();

        res.json({
            success: true,
            message: "Feedback submitted successfully",
        });
    } catch (error) {
        console.error("Feedback error:", error);
        res.status(500).json({ error: "Failed to submit feedback" });
    }
});

/**
 * @route   DELETE /api/chatbot/session/:sessionId
 * @desc    End a conversation session
 * @access  Public
 */
router.delete("/session/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;

        await ChatConversation.updateOne({ sessionId }, { isActive: false });

        res.json({
            success: true,
            message: "Session ended successfully",
        });
    } catch (error) {
        console.error("End session error:", error);
        res.status(500).json({ error: "Failed to end session" });
    }
});

/**
 * @route   GET /api/chatbot/growth/:userId
 * @desc    Get student growth summary
 * @access  Private (should be authenticated)
 */
router.get("/growth/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const growthSummary = await StudentGrowth.getGrowthSummary(userId);

        if (!growthSummary) {
            return res.json({
                success: true,
                growth: null,
                message: "No growth data available yet. Start interacting to track your progress!",
            });
        }

        res.json({
            success: true,
            growth: growthSummary,
        });
    } catch (error) {
        console.error("Get growth error:", error);
        res.status(500).json({ error: "Failed to get growth data" });
    }
});

/**
 * @route   GET /api/chatbot/navigation
 * @desc    Get available navigation commands
 * @access  Public
 */
router.get("/navigation", async (req, res) => {
    try {
        res.json({
            success: true,
            commands: NAVIGATION_COMMANDS,
        });
    } catch (error) {
        console.error("Get navigation error:", error);
        res.status(500).json({ error: "Failed to get navigation commands" });
    }
});

/**
 * @route   GET /api/chatbot/suggestions/:userRole
 * @desc    Get role-based suggestions
 * @access  Public
 */
router.get("/suggestions/:userRole", async (req, res) => {
    try {
        const { userRole } = req.params;

        const suggestions = {
            student: [
                { id: "1", text: "How to submit assignments?", category: "navigation" },
                { id: "2", text: "Check my attendance", category: "navigation" },
                { id: "3", text: "Help with DSA", category: "academics" },
                { id: "4", text: "Placement preparation", category: "career" },
                { id: "5", text: "View my grades", category: "navigation" },
                { id: "6", text: "Pay semester fees", category: "navigation" },
            ],
            faculty: [
                { id: "1", text: "Manage my courses", category: "navigation" },
                { id: "2", text: "View student performance", category: "analytics" },
                { id: "3", text: "Create new assignment", category: "action" },
                { id: "4", text: "Update grades", category: "action" },
            ],
            admin: [
                { id: "1", text: "System overview", category: "analytics" },
                { id: "2", text: "User management", category: "navigation" },
                { id: "3", text: "Generate reports", category: "action" },
                { id: "4", text: "Manage events", category: "navigation" },
            ],
            guest: [
                { id: "1", text: "About CVR College", category: "info" },
                { id: "2", text: "Courses offered", category: "info" },
                { id: "3", text: "Admission process", category: "info" },
                { id: "4", text: "Campus facilities", category: "info" },
                { id: "5", text: "Placement statistics", category: "info" },
                { id: "6", text: "Contact information", category: "info" },
            ],
        };

        res.json({
            success: true,
            suggestions: suggestions[userRole] || suggestions.guest,
        });
    } catch (error) {
        console.error("Get suggestions error:", error);
        res.status(500).json({ error: "Failed to get suggestions" });
    }
});

module.exports = router;
