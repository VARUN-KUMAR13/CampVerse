import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [userType, setUserType] = useState<"Student" | "Faculty">("Student");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple mock authentication
    if (userId && password) {
      if (userType === "Student") {
        navigate("/student/dashboard");
      } else {
        navigate("/faculty/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-purple-500/10 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Welcome message with campus image */}
        <div className="hidden lg:block relative">
          <div className="relative h-[600px] bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl overflow-hidden">
            {/* Campus background - using a placeholder gradient for now */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-500/20"></div>

            {/* Overlay content */}
            <div className="relative z-10 p-12 flex flex-col justify-center h-full text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Welcome to
                <br />
                CampusConnect
              </h1>
              <p className="text-lg text-muted-foreground">
                "Simplifying campus life, one feature at a time."
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
              {/* User Type Toggle */}
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setUserType("Student")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    userType === "Student"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("Faculty")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    userType === "Faculty"
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
                  <Input
                    type="text"
                    placeholder="Enter ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>

                <div>
                  <Input
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold"
                  size="lg"
                >
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
