import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "./firebase";

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

// API base URL (should be environment variable)
const API_BASE_URL = "http://localhost:5000/api";

// Create user account
export const createUserAccount = async (collegeId: string, name: string) => {
  try {
    // Validate college ID
    if (!validateCollegeId(collegeId)) {
      throw new Error("Invalid college ID format");
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
    // Handle admin login
    if (collegeId === "admin" && password === "admin") {
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
    }

    // Validate college ID format
    if (!validateCollegeId(collegeId)) {
      throw new Error("Invalid college ID format");
    }

    const email = collegeIdToEmail(collegeId);

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
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

// Send password reset email
export const resetPassword = async (collegeId: string) => {
  try {
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
