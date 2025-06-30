import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
    return userData;
  };

  const logout = async (): Promise<void> => {
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
