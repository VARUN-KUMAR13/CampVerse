const mongoose = require("mongoose");

const knowledgeBaseSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
            enum: [
                "college_info",
                "academics",
                "admissions",
                "departments",
                "facilities",
                "placements",
                "events",
                "clubs",
                "fees",
                "navigation",
                "faq",
                "contact",
            ],
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        keywords: [String],
        priority: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        metadata: {
            lastUpdated: {
                type: Date,
                default: Date.now,
            },
            updatedBy: String,
            version: {
                type: Number,
                default: 1,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Text index for search
knowledgeBaseSchema.index({ title: "text", content: "text", keywords: "text" });

// Static method to search knowledge base
knowledgeBaseSchema.statics.search = async function (query, category = null) {
    const searchQuery = { isActive: true };

    if (category) {
        searchQuery.category = category;
    }

    // Text search
    const results = await this.find(
        { ...searchQuery, $text: { $search: query } },
        { score: { $meta: "textScore" } }
    )
        .sort({ score: { $meta: "textScore" }, priority: -1 })
        .limit(5);

    // If no text search results, try keyword matching
    if (results.length === 0) {
        const keywordResults = await this.find({
            ...searchQuery,
            keywords: { $regex: query, $options: "i" },
        })
            .sort({ priority: -1 })
            .limit(5);
        return keywordResults;
    }

    return results;
};

// Static method to get by category
knowledgeBaseSchema.statics.getByCategory = function (category) {
    return this.find({ category, isActive: true }).sort({ priority: -1 });
};

module.exports = mongoose.model("KnowledgeBase", knowledgeBaseSchema);
