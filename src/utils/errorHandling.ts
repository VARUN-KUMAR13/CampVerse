/**
 * Comprehensive Error Handling Utilities for CampVerse
 * Provides safe JSON parsing and error handling methods
 */

// Safe JSON parsing utility
export const safeJsonParse = <T = any>(
  jsonString: string | null | undefined,
  fallback: T | null = null
): T | null => {
  if (!jsonString || jsonString === 'undefined' || jsonString === 'null') {
    return fallback;
  }

  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.warn('JSON parsing failed:', error);
    return fallback;
  }
};

// Safe localStorage operations
export const safeLocalStorage = {
  getItem: <T = string>(key: string, fallback: T | null = null): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return fallback;
      
      // If fallback is not a string, attempt to parse as JSON
      if (typeof fallback !== 'string' && fallback !== null) {
        return safeJsonParse<T>(item, fallback);
      }
      
      return item as T;
    } catch (error) {
      console.warn(`LocalStorage getItem failed for key "${key}":`, error);
      return fallback;
    }
  },

  setItem: (key: string, value: any): boolean => {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.warn(`LocalStorage setItem failed for key "${key}":`, error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`LocalStorage removeItem failed for key "${key}":`, error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('LocalStorage clear failed:', error);
      return false;
    }
  }
};

// Safe fetch wrapper
export const safeFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<{ data: any; error: string | null; ok: boolean }> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Handle HTTP errors
      if (response.status === 404) {
        return {
          data: null,
          error: 'Resource not found',
          ok: false,
        };
      }
      
      if (response.status === 401) {
        return {
          data: null,
          error: 'Unauthorized access',
          ok: false,
        };
      }

      if (response.status === 500) {
        return {
          data: null,
          error: 'Server error',
          ok: false,
        };
      }

      return {
        data: null,
        error: `HTTP ${response.status}: ${response.statusText}`,
        ok: false,
      };
    }

    // Try to parse response as JSON
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        const data = await response.json();
        return { data, error: null, ok: true };
      } catch (jsonError) {
        return {
          data: null,
          error: 'Invalid JSON response from server',
          ok: false,
        };
      }
    } else {
      // If not JSON, return as text
      const text = await response.text();
      return { data: text, error: null, ok: true };
    }
  } catch (error) {
    // Network or other errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        data: null,
        error: 'Network error - please check your connection',
        ok: false,
      };
    }

    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      ok: false,
    };
  }
};

// API endpoint checker
export const isApiAvailable = async (baseUrl: string): Promise<boolean> => {
  try {
    const result = await safeFetch(`${baseUrl}/health`);
    return result.ok;
  } catch {
    return false;
  }
};

// Error message formatter
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null) {
    if ('message' in error) {
      return String(error.message);
    }
    
    return JSON.stringify(error);
  }
  
  return 'An unknown error occurred';
};

// Development mode helpers
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

export const isProduction = (): boolean => {
  return import.meta.env.PROD || import.meta.env.MODE === 'production';
};

// Console logger with environment awareness
export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment()) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment()) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
};

// Global error handler setup
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection:', event.reason);
    event.preventDefault(); // Prevent the default browser error handling
  });

  // Handle general runtime errors
  window.addEventListener('error', (event) => {
    logger.error('Runtime error:', event.error || event.message);
  });
};

// Retry utility for failed operations
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      logger.warn(`Operation failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
};

export default {
  safeJsonParse,
  safeLocalStorage,
  safeFetch,
  isApiAvailable,
  formatErrorMessage,
  isDevelopment,
  isProduction,
  logger,
  setupGlobalErrorHandling,
  retryOperation,
};
