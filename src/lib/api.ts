import { auth, isDevelopment, firebaseReady } from "./firebase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Token storage key
const TOKEN_KEY = "campverse_auth_token";

// Store token
export const setAuthToken = (token: string | null) => {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
};

// Get stored token
export const getStoredToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

// Clear token
export const clearAuthToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

const getAuthToken = async (): Promise<string | null> => {
    // First, check for stored JWT token (from backend login)
    const storedToken = getStoredToken();
    if (storedToken) {
        return storedToken;
    }

    // Fallback to Firebase token if available
    if (auth?.currentUser) {
        try {
            return await auth.currentUser.getIdToken();
        } catch (error) {
            console.error("Error getting Firebase token:", error);
        }
    }

    return null;
};

const getHeaders = async () => {
    const token = await getAuthToken();
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

export const api = {
    get: async (endpoint: string) => {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "GET",
            headers,
        });
        if (!response.ok) {
            if (response.status === 401) {
                console.error("Unauthorized API call - token may be expired");
                // Clear invalid token
                clearAuthToken();
            }
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response.json();
    },

    post: async (endpoint: string, data: any) => {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers,
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.statusText}`);
        }
        return response.json();
    },

    put: async (endpoint: string, data: any) => {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.statusText}`);
        }
        return response.json();
    },

    patch: async (endpoint: string, data: any) => {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.statusText}`);
        }
        return response.json();
    },

    delete: async (endpoint: string) => {
        const headers = await getHeaders();
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "DELETE",
            headers,
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.statusText}`);
        }
        return response.json();
    },
};
