/**
 * Seed Knowledge Base Script
 * Run this to populate the knowledge base with CVR College information
 * 
 * Usage: node scripts/seedKnowledge.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { seedKnowledgeBase } = require("./seedKnowledge");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/campverse";

async function main() {
    try {
        console.log("🔗 Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB");

        console.log("\n📚 Seeding knowledge base...");
        await seedKnowledgeBase();

        console.log("\n🎉 Knowledge base seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

main();
