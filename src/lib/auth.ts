import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
} from "firebase/auth";
import { auth, isDevelopment, firebaseReady } from "./firebase";
import { setAuthToken, clearAuthToken } from "./api";

export interface CollegeUser {
  uid: string;
  name: string;
  collegeId: string;
  email: string;
  role: "student" | "faculty" | "admin";
  year: string;
  section: string;
  branch: string;
  rollNumber: string;
}

// College ID pattern validation
export const validateCollegeId = (id: string): boolean => {
  const pattern = /^[0-9]{2}[A-Z0-9]{3}[A-Z][0-9]{2}[A-Z0-9]{1,2}$/;
  return pattern.test(id);
};

// Parse college ID to extract information
export const parseCollegeId = (id: string) => {
  if (!validateCollegeId(id)) {
    throw new Error("Invalid college ID format");
  }

  const year = id.substring(0, 2);
  const collegeCode = id.substring(2, 5);
  const section = id.substring(5, 6);
  const branch = id.substring(6, 8);
  const rollNumber = id.substring(8);

  const role: "student" | "faculty" = section === "Z" ? "faculty" : "student";

  return { year, collegeCode, section, branch, rollNumber, role };
};

// Convert college ID to email
export const collegeIdToEmail = (id: string): string => {
  return `${id}@cvr.ac.in`;
};

// API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

// Create user account — provisions Firebase Auth user via backend
export const createUserAccount = async (collegeId: string, name: string) => {
  if (collegeId !== "admin" && !validateCollegeId(collegeId)) {
    throw new Error("Invalid college ID format");
  }

  const response = await fetch(`${API_BASE_URL}/auth/provision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collegeId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create user");
  }

  const email = collegeIdToEmail(collegeId);
  const parsedInfo = validateCollegeId(collegeId) ? parseCollegeId(collegeId) : { year: "", collegeCode: "", section: "", branch: "", rollNumber: "", role: "admin" as const };

  return {
    uid: `${collegeId}-uid`,
    name,
    collegeId,
    email,
    ...parsedInfo,
  };
};

// Backend API login — for admin or fallback
const backendLogin = async (
  collegeId: string,
  password: string,
): Promise<CollegeUser> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collegeId, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Login failed");
  }

  const data = await response.json();

  if (data.token) {
    setAuthToken(data.token);
  }

  const user = data.user;
  return {
    uid: user.uid || user._id,
    name: user.name,
    collegeId: user.collegeId,
    email: user.email,
    role: user.role,
    year: user.year || "",
    section: user.section || "",
    branch: user.branch || "",
    rollNumber: user.rollNumber || "",
  };
};

// Firebase login — exchange Firebase ID token for backend JWT + user data
const firebaseBackendLogin = async (
  idToken: string,
  collegeId: string,
): Promise<CollegeUser> => {
  const response = await fetch(`${API_BASE_URL}/auth/firebase-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, collegeId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Firebase login failed");
  }

  const data = await response.json();

  if (data.token) {
    setAuthToken(data.token);
  }

  const user = data.user;
  return {
    uid: user.uid || user._id,
    name: user.name,
    collegeId: user.collegeId,
    email: user.email,
    role: user.role,
    year: user.year || "",
    section: user.section || "",
    branch: user.branch || "",
    rollNumber: user.rollNumber || "",
  };
};

// Provision Firebase user via backend (Admin SDK creates the user)
const provisionFirebaseUser = async (collegeId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/provision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collegeId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to provision user");
  }
};

// Sign in user — Firebase Auth first, backend JWT second
export const signInUser = async (
  collegeId: string,
  password: string,
): Promise<CollegeUser> => {
  // Admin login — authenticate with backend, then attempt Firebase Auth
  if (collegeId === "admin") {
    const user = await backendLogin(collegeId, password);
    if (firebaseReady && auth) {
      try {
        await signInWithEmailAndPassword(auth, "admin@cvr.ac.in", password);
      } catch (err: any) {
        console.warn("Firebase Auth Admin fallback failed", err.message);
      }
    }
    return user;
  }

  // Validate college ID
  if (!validateCollegeId(collegeId)) {
    throw new Error("Invalid college ID format");
  }

  const email = collegeIdToEmail(collegeId);

  // If Firebase is ready, use Firebase Auth
  if (firebaseReady && auth) {
    try {
      // Step 1: Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Step 2: Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      // Step 3: Exchange ID token for backend JWT + user data
      return await firebaseBackendLogin(idToken, collegeId);
    } catch (firebaseError: any) {
      // If user doesn't exist in Firebase, provision them
      if (firebaseError.code === "auth/user-not-found") {
        // Only allow provisioning if password matches collegeId (initial password)
        if (password !== collegeId) {
          throw new Error("Invalid college ID or password");
        }

        try {
          // Provision Firebase user via backend Admin SDK
          await provisionFirebaseUser(collegeId);

          // Retry sign-in after provisioning
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const idToken = await userCredential.user.getIdToken();
          return await firebaseBackendLogin(idToken, collegeId);
        } catch (provisionError: any) {
          console.error("Provision error:", provisionError);
          // Fall back to backend-only login
          return await backendLogin(collegeId, password);
        }
      }

      // If it's an invalid credential error
      if (firebaseError.code === "auth/wrong-password" ||
        firebaseError.code === "auth/invalid-credential") {
        // If user is using initial password (collegeId), reset Firebase password and retry
        if (password === collegeId) {
          try {
            await provisionFirebaseUser(collegeId); // This resets password to initial
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();
            return await firebaseBackendLogin(idToken, collegeId);
          } catch (retryError: any) {
            console.error("Retry after password reset failed:", retryError);
            return await backendLogin(collegeId, password);
          }
        }
        throw new Error("Invalid password. If you've reset your password, use the new one.");
      }

      // For other Firebase errors, re-throw with clear message
      if (firebaseError.code === "auth/too-many-requests") {
        throw new Error("Too many login attempts. Please try again later.");
      }

      // Fallback to backend login for any other Firebase error
      console.warn("Firebase sign-in failed, trying backend:", firebaseError.message);
      return await backendLogin(collegeId, password);
    }
  }

  // Firebase not ready — fallback to backend-only login
  return await backendLogin(collegeId, password);
};

// Send password reset email via Firebase's built-in sender
export const resetPassword = async (collegeId: string): Promise<void> => {
  if (collegeId === "admin") {
    throw new Error("Admin password cannot be reset");
  }

  if (!validateCollegeId(collegeId)) {
    throw new Error("Invalid college ID format");
  }

  const email = collegeIdToEmail(collegeId);

  // Step 1: Ensure Firebase Auth user exists
  try {
    await provisionFirebaseUser(collegeId);
  } catch (err) {
    console.warn("Provision check failed:", err);
  }

  // Step 2: Send Firebase's built-in reset email
  if (firebaseReady && auth) {
    await sendPasswordResetEmail(auth, email);
  } else {
    throw new Error("Password reset is currently unavailable. Please try again later.");
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    clearAuthToken();
    console.log("Auth token cleared");

    if (firebaseReady && auth) {
      await signOut(auth);
    }
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Get current user data
export const getCurrentUserData = async (
  user: User,
): Promise<CollegeUser | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${user.uid}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};
