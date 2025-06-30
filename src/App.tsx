import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import Index from "./pages/Index";
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

// Faculty Dashboard Pages
import FacultyDashboard from "./pages/faculty/Dashboard";
import FacultyStudents from "./pages/faculty/Students";
import FacultyAssignments from "./pages/faculty/Assignments";

// Admin Dashboard Pages
import AdminDashboard from "./pages/admin/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes with Navigation */}
            <Route
              path="/"
              element={
                <>
                  <Navigation />
                  <Index />
                </>
              }
            />
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
              path="/student/dashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses"
              element={
                <ProtectedRoute>
                  <StudentCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/schedule"
              element={
                <ProtectedRoute>
                  <StudentSchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/results"
              element={
                <ProtectedRoute>
                  <StudentResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/attendance"
              element={
                <ProtectedRoute>
                  <StudentAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assignments"
              element={
                <ProtectedRoute>
                  <StudentAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/exams"
              element={
                <ProtectedRoute>
                  <StudentExams />
                </ProtectedRoute>
              }
            />

            {/* Faculty Dashboard Routes (protected, no navigation) */}
            <Route
              path="/faculty/dashboard"
              element={
                <ProtectedRoute>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/students"
              element={
                <ProtectedRoute>
                  <FacultyStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/assignments"
              element={
                <ProtectedRoute>
                  <FacultyAssignments />
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard Routes (protected, no navigation) */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
