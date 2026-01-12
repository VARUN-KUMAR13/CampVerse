import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";

declare global {
  interface Window {
    __dotlottieLoaded?: boolean;
  }
}
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PlacementProvider } from "@/contexts/PlacementContext";
import { EventProvider } from "@/contexts/EventContext";
import { ClubProvider } from "@/contexts/ClubContext";
import { ExamProvider } from "@/contexts/ExamContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";
import DynamicHomepage from "./components/DynamicHomepage";
import { AIChatbot } from "./components/AIChatbot";
import ErrorBoundary from "./components/ErrorBoundary";
import { LoadingPage } from "./components/LoadingSystem";
import { useAuth } from "./contexts/AuthContext";
import { setupGlobalErrorHandling } from "./utils/errorHandling";

// Setup global error handling
setupGlobalErrorHandling();

// Public Pages
import Features from "./pages/Features";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Student Dashboard Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentCourses from "./pages/student/Courses";
import StudentSchedule from "./pages/student/Schedule";
import StudentResults from "./pages/student/Results";
import StudentAttendance from "./pages/student/Attendance";
import StudentAssignments from "./pages/student/Assignments";
import StudentExams from "./pages/student/Exams";
import StudentPlacement from "./pages/student/Placement";
import StudentEvents from "./pages/student/Events";
import StudentClubs from "./pages/student/Clubs";
import StudentProfile from "./pages/student/Profile";
import StudentSettings from "./pages/student/Settings";
import StudentFees from "./pages/student/Fees";

// Faculty Dashboard Pages
import FacultyDashboard from "./pages/faculty/Dashboard";
import FacultyCourses from "./pages/faculty/Courses";
import FacultyStudents from "./pages/faculty/Students";
import FacultyAssignments from "./pages/faculty/Assignments";
import FacultyGrades from "./pages/faculty/Grades";
import FacultySchedule from "./pages/faculty/Schedule";
import FacultyProfile from "./pages/faculty/Profile";
import FacultySettings from "./pages/faculty/Settings";

// Admin Dashboard Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminPlacement from "./pages/admin/Placement";
import AdminEvents from "./pages/admin/Events";
import AdminClubs from "./pages/admin/Clubs";
import AdminExams from "./pages/admin/Exams";
import AdminAlerts from "./pages/admin/Alerts";
import StudentDataManagement from "./pages/admin/StudentDataManagement";

const queryClient = new QueryClient();

// App content component
const AppContent = () => {
  const { loading } = useAuth();

  useEffect(() => {
    // Load DotLottie web component script globally (only once)
    if (!window.__dotlottieLoaded) {
      const script = document.createElement("script");
      script.src =
        "https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.5/dist/dotlottie-wc.js";
      script.type = "module";
      script.async = true;
      document.head.appendChild(script);
      window.__dotlottieLoaded = true;
    }
  }, []);

  if (loading) {
    return <LoadingPage message="Initializing CampVerse..." />;
  }

  return (
    <BrowserRouter>
      <AIChatbot />
      <Routes>
        {/* Dynamic Homepage - shows landing page or dashboard based on auth */}
        <Route path="/" element={<DynamicHomepage />} />

        {/* Public Routes with Navigation */}
        <Route
          path="/features"
          element={
            <>
              <Navigation />
              <Features />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <Navigation />
              <About />
            </>
          }
        />
        <Route
          path="/faq"
          element={
            <>
              <Navigation />
              <FAQ />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <Navigation />
              <Contact />
            </>
          }
        />

        {/* Login Route (no navigation) */}
        <Route path="/login" element={<Login />} />

        {/* Student Dashboard Routes (protected, no navigation) */}
        <Route
          path="/student/courses"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/schedule"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/results"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/exams"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentExams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/placement"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentPlacement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/events"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/clubs"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentClubs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/settings"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/fees"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentFees />
            </ProtectedRoute>
          }
        />

        {/* Faculty Dashboard Routes (protected, no navigation) */}
        <Route
          path="/faculty/courses"
          element={
            <ProtectedRoute requiredRole="faculty">
              <FacultyCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/students"
          element={
            <ProtectedRoute requiredRole="faculty">
              <FacultyStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/assignments"
          element={
            <ProtectedRoute requiredRole="faculty">
              <FacultyAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/grades"
          element={
            <ProtectedRoute requiredRole="faculty">
              <FacultyGrades />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/schedule"
          element={
            <ProtectedRoute requiredRole="faculty">
              <FacultySchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/profile"
          element={
            <ProtectedRoute requiredRole="faculty">
              <FacultyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/settings"
          element={
            <ProtectedRoute requiredRole="faculty">
              <FacultySettings />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard Routes (protected, no navigation) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/student-data-management"
          element={
            <ProtectedRoute requiredRole="admin">
              <StudentDataManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/placement"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPlacement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/event"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/club"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminClubs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/alerts"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminAlerts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/exam"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminExams />
            </ProtectedRoute>
          }
        />

        {/* Student Main Dashboard Route */}
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Faculty Main Dashboard Route */}
        <Route
          path="/faculty"
          element={
            <ProtectedRoute requiredRole="faculty">
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />

        {/* Legacy Dashboard Routes - Redirect to main dashboard */}
        <Route path="/student/dashboard" element={<DynamicHomepage />} />
        <Route path="/faculty/dashboard" element={<DynamicHomepage />} />

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PlacementProvider>
          <EventProvider>
            <ClubProvider>
              <ExamProvider>
                <NotificationProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <AppContent />
                  </TooltipProvider>
                </NotificationProvider>
              </ExamProvider>
            </ClubProvider>
          </EventProvider>
        </PlacementProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
