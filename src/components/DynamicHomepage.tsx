import { useAuth } from "@/contexts/AuthContext";
import Navigation from "./Navigation";
import Index from "@/pages/Index";
import StudentDashboard from "@/pages/student/Dashboard";
import FacultyDashboard from "@/pages/faculty/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";

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

  // If user is authenticated, show their respective dashboard
  switch (userData.role) {
    case "student":
      return <StudentDashboard />;
    case "faculty":
      return <FacultyDashboard />;
    case "admin":
      return <AdminDashboard />;
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
