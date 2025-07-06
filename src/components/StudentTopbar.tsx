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
import { Bell, Search, Menu, User, Settings, LogOut } from "lucide-react";
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
    }, 60000); // Update every minute

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
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu and breadcrumb */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Right side - Time, Notifications, Student ID, and Avatar */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">
              {format(currentDateTime, "MMM dd, yyyy")}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(currentDateTime, "h:mm a")}
            </div>
          </div>

          {/* Notification Bell */}
          <NotificationBell />

          <div className="flex items-center space-x-2">
            <div className="text-xs text-muted-foreground">ID: {studentId}</div>
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${userData?.name || studentId}`}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {studentId.slice(-2)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">
                    {userData?.name || `Student ${studentId}`}
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
              <DropdownMenuItem onClick={handleLogout}>
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
