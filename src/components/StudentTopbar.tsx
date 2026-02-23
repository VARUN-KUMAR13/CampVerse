import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, Menu, User, Settings, LogOut, GraduationCap } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

interface StudentTopbarProps {
  studentId: string;
}

const StudentTopbar = ({ studentId }: StudentTopbarProps) => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Update every second for accurate time

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - CampVerse branding */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-lg">CampVerse</span>
        </div>

        {/* Right side - Time, Notifications, Student ID, and Avatar */}
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

          {/* Notification Bell */}
          <NotificationBell />

          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">
                User ID : {userData?.collegeId || studentId}
              </div>
            </div>
          </div>

          {/* Profile Dropdown */}
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
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">
                    {userData?.collegeId || studentId}
                  </p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {userData?.email || `${studentId}@cvr.ac.in`}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/student/profile`)}>
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/student/settings`)}>
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

export default StudentTopbar;
