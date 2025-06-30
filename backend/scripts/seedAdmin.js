require("dotenv").config();
const mongoose = require("mongoose");
const admin = require("firebase-admin");
const User = require("../models/User");

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    }),
  });
}

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/campverse",
    );
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ collegeId: "ADMIN" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user in Firebase
    let adminUser;
    try {
      adminUser = await admin.auth().createUser({
        email: "admin@cvr.ac.in",
        password: "admin",
        displayName: "Administrator",
        emailVerified: true,
      });
      console.log("Admin user created in Firebase");
    } catch (error) {
      if (error.code === "auth/email-already-exists") {
        // Get existing user
        adminUser = await admin.auth().getUserByEmail("admin@cvr.ac.in");
        console.log("Admin user already exists in Firebase");
      } else {
        throw error;
      }
    }

    // Create admin user in MongoDB
    const adminData = new User({
      uid: adminUser.uid,
      name: "Administrator",
      collegeId: "ADMIN",
      email: "admin@cvr.ac.in",
      role: "admin",
    });

    await adminData.save();
    console.log("Admin user created in MongoDB");

    console.log("✅ Admin setup completed successfully");
    console.log("Login credentials:");
    console.log("  ID: admin");
    console.log("  Password: admin");
    console.log("  Email: admin@cvr.ac.in");
  } catch (error) {
    console.error("❌ Error setting up admin:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

seedAdmin();
