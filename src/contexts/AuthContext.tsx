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
    // Helper to restore user from localStorage
    const restoreFromStorage = (): boolean => {
      const storedUser = localStorage.getItem("dev-user");
      if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.uid && parsedUser.email) {
            setUserData(parsedUser);
            setCurrentUser({
              uid: parsedUser.uid,
              email: parsedUser.email,
            } as User);
            return true;
          } else {
            localStorage.removeItem("dev-user");
          }
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          localStorage.removeItem("dev-user");
        }
      }
      return false;
    };

    if (isDevelopment || !firebaseReady || !auth) {
      console.log("AuthContext: Using development mode");
      restoreFromStorage();
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
        // No Firebase user — try localStorage fallback (for backend JWT login)
        restoreFromStorage();
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
    const result = await signInUser(collegeId, password);

    // Always set user data after successful login (both dev and production)
    try {
      localStorage.setItem("dev-user", JSON.stringify(result));
      setUserData(result);
      setCurrentUser({
        uid: result.uid,
        email: result.email,
      } as User);
    } catch (error) {
      console.error("Error storing user data:", error);
      setUserData(result);
      setCurrentUser({
        uid: result.uid,
        email: result.email,
      } as User);
    }

    return result;
  };

  const logout = async (): Promise<void> => {
    // Always clear stored user data
    localStorage.removeItem("dev-user");
    setUserData(null);
    setCurrentUser(null);

    if (!isDevelopment && firebaseReady) {
      const { signOutUser } = await import("@/lib/auth");
      await signOutUser();
    }
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
