import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Navigation from "./Navigation";
import Index from "@/pages/Index";

const DynamicHomepage = () => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show public landing page
  if (!currentUser || !userData) {
    return (
      <>
        <Navigation />
        <Index />
      </>
    );
  }

  // If user is authenticated, redirect to their respective dashboard URL
  switch (userData.role) {
    case "student":
      return <Navigate to="/student" replace />;
    case "faculty":
      return <Navigate to="/faculty" replace />;
    case "admin":
      return <Navigate to="/admin" replace />;
    default:
      return (
        <>
          <Navigation />
          <Index />
        </>
      );
  }
};

export default DynamicHomepage;
