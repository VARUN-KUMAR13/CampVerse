import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PlacementProvider } from "@/contexts/PlacementContext";
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";
import DynamicHomepage from "./components/DynamicHomepage";

// Public Pages
import Features from "./pages/Features";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Student Dashboard Pages
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

// Faculty Dashboard Pages
import FacultyCourses from "./pages/faculty/Courses";
import FacultyStudents from "./pages/faculty/Students";
import FacultyAssignments from "./pages/faculty/Assignments";
import FacultyGrades from "./pages/faculty/Grades";
import FacultySchedule from "./pages/faculty/Schedule";
import FacultySettings from "./pages/faculty/Settings";

// Admin Dashboard Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminPlacement from "./pages/admin/Placement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PlacementProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
                path="/faculty/settings"
                element={
                  <ProtectedRoute requiredRole="faculty">
                    <FacultySettings />
                  </ProtectedRoute>
                }
              />

              {/* Admin Dashboard Routes (protected, no navigation) */}
              <Route
                path="/admin/placement"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPlacement />
                  </ProtectedRoute>
                }
              />

              {/* Legacy Dashboard Routes - Redirect to Homepage */}
              <Route path="/student/dashboard" element={<DynamicHomepage />} />
              <Route path="/faculty/dashboard" element={<DynamicHomepage />} />
              <Route path="/admin/dashboard" element={<DynamicHomepage />} />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PlacementProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
