import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { config, validateConfig, logConfig } from "@/config/environment";

// Validate configuration on startup
const validation = validateConfig();
if (!validation.valid) {
  console.error('Firebase configuration errors:', validation.errors);
  if (config.IS_PRODUCTION) {
    throw new Error('Invalid Firebase configuration for production environment');
  }
}

// Log configuration in development
if (config.IS_DEVELOPMENT) {
  logConfig();
}

// Force development mode until Firebase Authentication is properly configured
// This prevents CONFIGURATION_NOT_FOUND errors
const isDevelopment = config.IS_DEVELOPMENT || !config.IS_PRODUCTION;

// Initialize Firebase
let app: any;
let auth: any;
let analytics: any;
let database: any;
let storage: any;
let firestore: any;
let firebaseReady = false;

try {
  // Check if API key is present (and not an empty string)
  if (config.FIREBASE_CONFIG.apiKey) {
    app = initializeApp(config.FIREBASE_CONFIG);
    auth = getAuth(app);
    database = getDatabase(app);
    storage = getStorage(app);
    firestore = getFirestore(app);

    // Initialize Analytics only if feature is enabled and in browser environment
    if (typeof window !== 'undefined' && config.FIREBASE_CONFIG.measurementId && config.FEATURES?.ANALYTICS) {
      try {
        analytics = getAnalytics(app);
      } catch (analyticsError) {
        console.log("Analytics disabled or unavailable");
      }
    }

    firebaseReady = true;
    console.log("Firebase initialized successfully");
  } else {
    console.log("Firebase credentials not configured, using development mode");
  }
} catch (error) {
  console.warn("Firebase initialization failed, running in development mode:", error);
  firebaseReady = false;
  if (config.IS_PRODUCTION) {
    throw error;
  }
}

// Export environment flags
export const isProduction = config.IS_PRODUCTION;

export { auth, analytics, database, storage, firestore, isDevelopment, firebaseReady };
export default app;

