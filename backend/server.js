require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const admin = require("firebase-admin");

const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Body parser with increased limit for PDF uploads (MUST be before other middleware)
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/campverse", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Firebase Admin Setup (optional - only if service account env vars are present)
try {
  const hasFirebaseServiceAccount =
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL;

  if (hasFirebaseServiceAccount && !admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL ||
        process.env.VITE_FIREBASE_DATABASE_URL ||
        "https://campverse-2004-default-rtdb.asia-southeast1.firebasedatabase.app",
    });
    console.log("Firebase Admin initialized with Realtime Database");
  } else {
    console.log("Firebase Admin not configured; skipping admin initialization");
  }
} catch (firebaseError) {
  console.warn("Failed to initialize Firebase Admin, continuing without it:", firebaseError.message);
}

// Import routes
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const placementRoutes = require("./routes/placements");
const eventRoutes = require("./routes/events");
const clubRoutes = require("./routes/clubs");
const examRoutes = require("./routes/exams");
const paymentRoutes = require("./routes/payments");
const chatbotRoutes = require("./routes/chatbot");
const assignmentRoutes = require("./routes/assignments");
const gradeRoutes = require("./routes/grades");
const courseRoutes = require("./routes/courses");
const studentRoutes = require("./routes/students");
const contactRoutes = require("./routes/contact");

// Import middleware
const { corsHandler, rateLimiter, validateApiVersion } = require("./middleware/auth");

// Apply global middleware
app.use(corsHandler());
app.use(rateLimiter());
app.use(validateApiVersion());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/placements", placementRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/contact", contactRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "CampVerse API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CampVerse API server running on port ${PORT}`);
});
