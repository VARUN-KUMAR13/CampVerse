import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { validateCollegeId } from "@/lib/auth";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [userType, setUserType] = useState<"Student" | "Faculty">("Student");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) {
      setError("Please fill in all fields");
      return;
    }

    // Validate college ID format (except for admin)
    if (userId !== "admin" && !validateCollegeId(userId)) {
      setError("Invalid ID format");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(userId, password);
      // Redirect to homepage - DynamicHomepage will show the appropriate dashboard
      navigate("/", { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle specific Firebase errors
      if (error.code === "auth/user-not-found") {
        setError("User not found. Please check your ID or contact admin.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password. Try again or reset your password.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!userId) {
      setError("Please enter your ID first");
      return;
    }

    if (userId === "admin") {
      setError("Admin password cannot be reset");
      return;
    }

    if (!validateCollegeId(userId)) {
      setError("Please enter a valid User ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { resetPassword } = await import("@/lib/auth");
      await resetPassword(userId);
      setResetEmailSent(true);
    } catch (error: any) {
      setError(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  // Auto-detect user type based on college ID
  const handleUserIdChange = (value: string) => {
    setUserId(value);
    setError("");
    setResetEmailSent(false);

    // Auto-detect role based on section (6th character)
    if (value.length >= 6 && value !== "admin") {
      const section = value.charAt(5);
      if (section === "Z") {
        setUserType("Faculty");
      } else if (section.match(/[A-F]/)) {
        setUserType("Student");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-purple-500/10 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Welcome message */}
        <div className="hidden lg:block relative">
          <div className="relative h-[600px] bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-500/20"></div>
            <div className="relative z-10 p-12 flex flex-col justify-center h-full text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Welcome to
                <br />
                CampVerse
              </h1>
              <p className="text-lg text-muted-foreground">
                Simplifying campus life, one feature at a time.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-2xl border-border/50">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-bold">Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {resetEmailSent && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Password reset email sent to {userId}@cvr.ac.in
                  </AlertDescription>
                </Alert>
              )}

              {/* User Type Toggle */}
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setUserType("Student")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${userType === "Student"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("Faculty")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${userType === "Faculty"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Faculty
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    User ID
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your User ID"
                    value={userId}
                    onChange={(e) => handleUserIdChange(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Login"
                  )}
                </Button>

                {/* Forgot Password */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                    disabled={loading}
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
