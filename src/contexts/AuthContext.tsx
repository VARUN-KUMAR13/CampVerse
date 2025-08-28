import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, isDevelopment, firebaseReady } from "@/lib/firebase";
import { CollegeUser, getCurrentUserData } from "@/lib/auth";

interface AuthContextType {
  currentUser: User | null;
  userData: CollegeUser | null;
  loading: boolean;
  login: (collegeId: string, password: string) => Promise<CollegeUser>;
  logout: () => Promise<void>;
  resetPassword: (collegeId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<CollegeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDevelopment || !firebaseReady || !auth) {
      // In development mode or Firebase not ready, check for stored user data
      console.log("AuthContext: Using development mode");
      const storedUser = localStorage.getItem("dev-user");
      if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.uid && parsedUser.email) {
            setUserData(parsedUser);
            // Create a mock User object
            setCurrentUser({
              uid: parsedUser.uid,
              email: parsedUser.email,
            } as User);
          } else {
            localStorage.removeItem("dev-user");
          }
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          localStorage.removeItem("dev-user");
        }
      }
      setLoading(false);
      return;
    }

    // Production mode with Firebase
    console.log("AuthContext: Using Firebase authentication");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Get user data from database
        const data = await getCurrentUserData(user);
        setUserData(data);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (
    collegeId: string,
    password: string,
  ): Promise<CollegeUser> => {
    const { signInUser } = await import("@/lib/auth");
    const userData = await signInUser(collegeId, password);

    if (isDevelopment) {
      // Store user data in localStorage for development mode
      try {
        localStorage.setItem("dev-user", JSON.stringify(userData));
        setUserData(userData);
        setCurrentUser({
          uid: userData.uid,
          email: userData.email,
        } as User);
      } catch (error) {
        console.error("Error storing user data:", error);
        setUserData(userData);
        setCurrentUser({
          uid: userData.uid,
          email: userData.email,
        } as User);
      }
    }

    return userData;
  };

  const logout = async (): Promise<void> => {
    if (isDevelopment) {
      // Clear stored user data in development mode
      localStorage.removeItem("dev-user");
      setUserData(null);
      setCurrentUser(null);
      return;
    }

    const { signOutUser } = await import("@/lib/auth");
    await signOutUser();
  };

  const resetPassword = async (collegeId: string): Promise<void> => {
    const { resetPassword: resetPass } = await import("@/lib/auth");
    await resetPass(collegeId);
  };

  const value = {
    currentUser,
    userData,
    loading,
    login,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
