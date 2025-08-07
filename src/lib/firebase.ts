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

// Check if we're in development mode without Firebase credentials
const isDevelopment = config.IS_DEVELOPMENT && !import.meta.env.VITE_FIREBASE_API_KEY;

// Initialize Firebase
let app: any;
let auth: any;

try {
  app = initializeApp(config.FIREBASE_CONFIG);
  auth = getAuth(app);
} catch (error) {
  console.warn("Firebase initialization failed, running in development mode");
  if (config.IS_PRODUCTION) {
    throw error;
  }
}

// Export environment flags
export const isProduction = config.IS_PRODUCTION;

export { auth, isDevelopment };
export default app;
