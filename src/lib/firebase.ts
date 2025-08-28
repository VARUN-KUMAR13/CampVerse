import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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
let firebaseReady = false;

try {
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY !== 'demo-api-key') {
    app = initializeApp(config.FIREBASE_CONFIG);
    auth = getAuth(app);
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

export { auth, isDevelopment, firebaseReady };
export default app;
