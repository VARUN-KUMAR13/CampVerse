import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu, Settings, User } from "lucide-react";

const EducatorIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Head */}
    <circle cx="50" cy="24" r="17" />
    {/* Body & Arms */}
    <path d="M 50 54 L 60 44 C 74 44 82 52 82 63 L 82 85 C 82 92 72 92 72 85 L 72 63 L 68 63 L 68 95 L 32 95 L 32 63 L 12 82 C 7 87 0 80 5 75 L 21 57 C 27 49 33 44 40 44 Z" />
  </svg>
);

const FacultyTopbar = () => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const facultyId = userData?.collegeId || "FACULTY";
  const facultyEmail = userData?.email || `${facultyId}@cvr.ac.in`;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border px-6 py-2.5">
      <div className="flex items-center justify-between">
        {/* Left side - CampVerse branding */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center p-1.5">
            <EducatorIcon className="w-full h-full text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-lg">CampVerse</span>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-6">
            <div className="text-lg font-semibold text-foreground">
              {format(currentDateTime, "h:mm a")}
            </div>
            <div className="text-center">
              <div className="text-base font-medium text-foreground">
                {format(currentDateTime, "MMM dd, yyyy")}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(currentDateTime, "EEEE")}
              </div>
            </div>
          </div>

          <NotificationBell />

          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">
                User ID : {facultyId}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-foreground">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center gap-2 p-2">
                <div className="flex flex-col leading-none">
                  <p className="font-medium">{facultyId}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {facultyEmail}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/faculty/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/faculty/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="bg-red-500/10 text-red-500 focus:bg-red-500/20 focus:text-red-500 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default FacultyTopbar;
