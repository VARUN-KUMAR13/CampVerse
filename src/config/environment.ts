/**
 * Environment Configuration for CampVerse
 * Centralized configuration for different environments
 */

// Environment types
export type Environment = 'development' | 'staging' | 'production';

// Configuration interface
interface Config {
  // Environment
  NODE_ENV: Environment;
  IS_DEVELOPMENT: boolean;
  IS_PRODUCTION: boolean;
  IS_STAGING: boolean;
  
  // API Configuration
  API_BASE_URL: string;
  WS_URL: string;
  
  // Firebase Configuration
  FIREBASE_CONFIG: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  
  // Feature Flags
  FEATURES: {
    REAL_TIME_UPDATES: boolean;
    AI_CHATBOT: boolean;
    FILE_UPLOAD: boolean;
    NOTIFICATIONS: boolean;
    ANALYTICS: boolean;
    ERROR_REPORTING: boolean;
    OFFLINE_SUPPORT: boolean;
  };
  
  // Limits and Constraints
  LIMITS: {
    MAX_FILE_SIZE: number; // in bytes
    MAX_FILES_PER_UPLOAD: number;
    SESSION_TIMEOUT: number; // in milliseconds
    REQUEST_TIMEOUT: number; // in milliseconds
    RETRY_ATTEMPTS: number;
  };
  
  // UI Configuration
  UI: {
    DEFAULT_THEME: 'light' | 'dark' | 'system';
    ENABLE_ANIMATIONS: boolean;
    AUTO_SAVE_INTERVAL: number; // in milliseconds
    TOAST_DURATION: number; // in milliseconds
  };
  
  // Security Configuration
  SECURITY: {
    ENABLE_CSP: boolean;
    SECURE_COOKIES: boolean;
    HSTS_MAX_AGE: number;
  };
  
  // Monitoring
  MONITORING: {
    SENTRY_DSN?: string;
    LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
    PERFORMANCE_MONITORING: boolean;
  };
}

// Get environment variable with fallback
const getEnvVar = (key: string, fallback: string = ''): string => {
  return import.meta.env[key] || fallback;
};

// Get boolean environment variable
const getBooleanEnvVar = (key: string, fallback: boolean = false): boolean => {
  const value = getEnvVar(key);
  if (value === '') return fallback;
  return value.toLowerCase() === 'true' || value === '1';
};

// Get numeric environment variable
const getNumericEnvVar = (key: string, fallback: number): number => {
  const value = getEnvVar(key);
  if (value === '') return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
};

// Determine current environment
const currentEnv: Environment = (getEnvVar('VITE_NODE_ENV', 'development') as Environment);

// Firebase configuration
const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY', 'demo-api-key'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', 'campverse-demo.firebaseapp.com'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', 'campverse-demo'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', 'campverse-demo.appspot.com'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID', '1:123456789:web:abcdef'),
  measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID') || undefined,
};

// Main configuration object
export const config: Config = {
  // Environment
  NODE_ENV: currentEnv,
  IS_DEVELOPMENT: currentEnv === 'development',
  IS_PRODUCTION: currentEnv === 'production',
  IS_STAGING: currentEnv === 'staging',
  
  // API Configuration
  API_BASE_URL: getEnvVar(
    'VITE_API_BASE_URL',
    currentEnv === 'production' 
      ? 'https://api.campverse.edu/api'
      : 'http://localhost:5000/api'
  ),
  WS_URL: getEnvVar(
    'VITE_WS_URL',
    currentEnv === 'production'
      ? 'wss://api.campverse.edu'
      : 'ws://localhost:5000'
  ),
  
  // Firebase Configuration
  FIREBASE_CONFIG: firebaseConfig,
  
  // Feature Flags
  FEATURES: {
    REAL_TIME_UPDATES: getBooleanEnvVar('VITE_FEATURE_REAL_TIME', true),
    AI_CHATBOT: getBooleanEnvVar('VITE_FEATURE_AI_CHATBOT', true),
    FILE_UPLOAD: getBooleanEnvVar('VITE_FEATURE_FILE_UPLOAD', true),
    NOTIFICATIONS: getBooleanEnvVar('VITE_FEATURE_NOTIFICATIONS', true),
    ANALYTICS: getBooleanEnvVar('VITE_FEATURE_ANALYTICS', currentEnv === 'production'),
    ERROR_REPORTING: getBooleanEnvVar('VITE_FEATURE_ERROR_REPORTING', currentEnv !== 'development'),
    OFFLINE_SUPPORT: getBooleanEnvVar('VITE_FEATURE_OFFLINE', false),
  },
  
  // Limits and Constraints
  LIMITS: {
    MAX_FILE_SIZE: getNumericEnvVar('VITE_MAX_FILE_SIZE', 10 * 1024 * 1024), // 10MB
    MAX_FILES_PER_UPLOAD: getNumericEnvVar('VITE_MAX_FILES_PER_UPLOAD', 5),
    SESSION_TIMEOUT: getNumericEnvVar('VITE_SESSION_TIMEOUT', 24 * 60 * 60 * 1000), // 24 hours
    REQUEST_TIMEOUT: getNumericEnvVar('VITE_REQUEST_TIMEOUT', 30 * 1000), // 30 seconds
    RETRY_ATTEMPTS: getNumericEnvVar('VITE_RETRY_ATTEMPTS', 3),
  },
  
  // UI Configuration
  UI: {
    DEFAULT_THEME: (getEnvVar('VITE_DEFAULT_THEME', 'system') as 'light' | 'dark' | 'system'),
    ENABLE_ANIMATIONS: getBooleanEnvVar('VITE_ENABLE_ANIMATIONS', true),
    AUTO_SAVE_INTERVAL: getNumericEnvVar('VITE_AUTO_SAVE_INTERVAL', 30 * 1000), // 30 seconds
    TOAST_DURATION: getNumericEnvVar('VITE_TOAST_DURATION', 5000), // 5 seconds
  },
  
  // Security Configuration
  SECURITY: {
    ENABLE_CSP: getBooleanEnvVar('VITE_ENABLE_CSP', currentEnv === 'production'),
    SECURE_COOKIES: getBooleanEnvVar('VITE_SECURE_COOKIES', currentEnv === 'production'),
    HSTS_MAX_AGE: getNumericEnvVar('VITE_HSTS_MAX_AGE', 31536000), // 1 year
  },
  
  // Monitoring
  MONITORING: {
    SENTRY_DSN: getEnvVar('VITE_SENTRY_DSN') || undefined,
    LOG_LEVEL: (getEnvVar('VITE_LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error'),
    PERFORMANCE_MONITORING: getBooleanEnvVar('VITE_PERFORMANCE_MONITORING', currentEnv === 'production'),
  },
};

// Validation function to check required environment variables
export const validateConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required Firebase config in production
  if (config.IS_PRODUCTION) {
    if (!config.FIREBASE_CONFIG.apiKey || config.FIREBASE_CONFIG.apiKey === 'demo-api-key') {
      errors.push('VITE_FIREBASE_API_KEY is required in production');
    }
    if (!config.FIREBASE_CONFIG.projectId || config.FIREBASE_CONFIG.projectId === 'campverse-demo') {
      errors.push('VITE_FIREBASE_PROJECT_ID is required in production');
    }
  }
  
  // Check API URL format
  try {
    new URL(config.API_BASE_URL);
  } catch {
    errors.push('VITE_API_BASE_URL must be a valid URL');
  }
  
  // Check WS URL format
  try {
    new URL(config.WS_URL);
  } catch {
    errors.push('VITE_WS_URL must be a valid URL');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// Log configuration on startup (excluding sensitive data)
export const logConfig = (): void => {
  if (config.IS_DEVELOPMENT) {
    console.group('🔧 CampVerse Configuration');
    console.log('Environment:', config.NODE_ENV);
    console.log('API Base URL:', config.API_BASE_URL);
    console.log('Features:', config.FEATURES);
    console.log('UI Config:', config.UI);
    console.groupEnd();
  }
};

// Helper functions
export const isFeatureEnabled = (feature: keyof Config['FEATURES']): boolean => {
  return config.FEATURES[feature];
};

export const getApiUrl = (endpoint: string): string => {
  return `${config.API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const getWsUrl = (path: string = ''): string => {
  return `${config.WS_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

// Export configuration as default
export default config;
