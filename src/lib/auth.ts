import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
} from "firebase/auth";
import { auth, isDevelopment, firebaseReady } from "./firebase";

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
  // Pattern: YYBBBSBBR (e.g., 22B81A05C3)
  // YY = Year, BBB = College code, S = Section, BB = Branch, R = Roll
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

  // Determine role based on section
  const role = section === "Z" ? "faculty" : "student";

  return {
    year,
    collegeCode,
    section,
    branch,
    rollNumber,
    role,
  };
};

// Convert college ID to email
export const collegeIdToEmail = (id: string): string => {
  return `${id}@cvr.ac.in`;
};

// Mock users for development
const mockUsers: Record<string, CollegeUser> = {
  admin: {
    uid: "admin-uid",
    name: "Administrator",
    collegeId: "admin",
    email: "admin@cvr.ac.in",
    role: "admin",
    year: "",
    section: "",
    branch: "",
    rollNumber: "",
  },
  "22B81A05C3": {
    uid: "student-uid-1",
    name: "John Doe",
    collegeId: "22B81A05C3",
    email: "22B81A05C3@cvr.ac.in",
    role: "student",
    year: "22",
    section: "A",
    branch: "05",
    rollNumber: "C3",
  },
  "22B81Z05F1": {
    uid: "faculty-uid-1",
    name: "Dr. Jane Smith",
    collegeId: "22B81Z05F1",
    email: "22B81Z05F1@cvr.ac.in",
    role: "faculty",
    year: "22",
    section: "Z",
    branch: "05",
    rollNumber: "F1",
  },
};

// Development mode authentication
const devSignIn = async (
  collegeId: string,
  password: string,
): Promise<CollegeUser> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check for admin login
  if (collegeId === "admin" && password === "admin") {
    return mockUsers.admin;
  }

  // Check if user exists in mock data
  if (mockUsers[collegeId]) {
    // In development mode, password should match college ID (default password)
    if (password === collegeId) {
      return mockUsers[collegeId];
    } else {
      throw new Error("Invalid password");
    }
  }

  // If user doesn't exist, try to create based on college ID format
  if (validateCollegeId(collegeId)) {
    // Check if password matches college ID (default password)
    if (password === collegeId) {
      const parsedInfo = parseCollegeId(collegeId);
      const newUser: CollegeUser = {
        uid: `${collegeId}-uid`,
        name: `User ${collegeId}`,
        collegeId,
        email: collegeIdToEmail(collegeId),
        ...parsedInfo,
      };

      // Add to mock users for future logins
      mockUsers[collegeId] = newUser;

      return newUser;
    } else {
      throw new Error("Invalid password");
    }
  }

  throw new Error("User not found");
};

// Development mode password reset
const devResetPassword = async (collegeId: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (collegeId === "admin") {
    throw new Error("Admin password cannot be reset");
  }

  if (!validateCollegeId(collegeId)) {
    throw new Error("Invalid college ID format");
  }

  console.log(
    `Development mode: Password reset email would be sent to ${collegeIdToEmail(collegeId)}`,
  );
};

// API base URL (should be environment variable)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Create user account
export const createUserAccount = async (collegeId: string, name: string) => {
  try {
    // Validate college ID
    if (!validateCollegeId(collegeId)) {
      throw new Error("Invalid college ID format");
    }

    if (isDevelopment) {
      // Development mode - just create mock user
      const parsedInfo = parseCollegeId(collegeId);
      const userData: CollegeUser = {
        uid: `${collegeId}-uid`,
        name,
        collegeId,
        email: collegeIdToEmail(collegeId),
        ...parsedInfo,
      };
      mockUsers[collegeId] = userData;
      return userData;
    }

    const email = collegeIdToEmail(collegeId);
    const password = collegeId; // Default password is the college ID

    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Parse college ID for additional info
    const parsedInfo = parseCollegeId(collegeId);

    // Create user in MongoDB via API
    const userData = {
      uid: user.uid,
      name,
      collegeId,
      email,
      ...parsedInfo,
    };

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Failed to create user in database");
    }

    return userData;
  } catch (error) {
    console.error("Error creating user account:", error);
    throw error;
  }
};

// Sign in user
export const signInUser = async (collegeId: string, password: string) => {
  try {
    // Development mode
    if (isDevelopment) {
      return await devSignIn(collegeId, password);
    }

    // Handle admin login
    if (collegeId === "admin" && password === "admin") {
      try {
        // For admin, we'll use a special email
        const email = "admin@cvr.ac.in";
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );

        return {
          uid: userCredential.user.uid,
          collegeId: "admin",
          email,
          role: "admin" as const,
          name: "Administrator",
          year: "",
          section: "",
          branch: "",
          rollNumber: "",
        };
      } catch (firebaseError: any) {
        // If Firebase fails, fall back to development mode for admin
        if (firebaseError.code === 'auth/network-request-failed' ||
            firebaseError.code === 'auth/user-not-found') {
          console.warn("Firebase Authentication not configured properly, falling back to development mode");
          return mockUsers.admin;
        }
        throw firebaseError;
      }
    }

    // Validate college ID format
    if (!validateCollegeId(collegeId)) {
      throw new Error("Invalid college ID format");
    }

    const email = collegeIdToEmail(collegeId);

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Get user data from MongoDB
      const response = await fetch(`${API_BASE_URL}/users/${user.uid}`);
      if (!response.ok) {
        throw new Error("User not found in database");
      }

      const userData = await response.json();
      return userData;
    } catch (firebaseError: any) {
      // If Firebase is not configured or user doesn't exist, fall back to development mode
      if (firebaseError.code === 'auth/network-request-failed' ||
          firebaseError.code === 'auth/user-not-found' ||
          firebaseError.code === 'auth/wrong-password') {
        console.warn("Firebase Authentication issue, falling back to development mode for user:", collegeId);
        return await devSignIn(collegeId, password);
      }
      throw firebaseError;
    }
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

// Send password reset email
export const resetPassword = async (collegeId: string) => {
  try {
    // Development mode
    if (isDevelopment) {
      return await devResetPassword(collegeId);
    }

    if (collegeId === "admin") {
      throw new Error("Admin password cannot be reset");
    }

    if (!validateCollegeId(collegeId)) {
      throw new Error("Invalid college ID format");
    }

    const email = collegeIdToEmail(collegeId);
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    if (isDevelopment) {
      // In development mode, just clear any stored state
      console.log("Development mode: User signed out");
      return;
    }
    await signOut(auth);
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
    if (isDevelopment) {
      // Return mock user data based on user object
      const collegeId = user.email?.split("@")[0] || "admin";
      return mockUsers[collegeId] || null;
    }

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
