import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  Award,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface FacultySidebarProps {
  onNavigate?: () => void;
}

const FacultySidebar = ({ onNavigate }: FacultySidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
      path: "/faculty/dashboard",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "Courses",
      path: "/faculty/courses",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Attendence",
      path: "/faculty/attendence",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Assignments",
      path: "/faculty/assignments",
    },
    {
      icon: <Award className="w-5 h-5" />,
      label: "Grades",
      path: "/faculty/grades",
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActiveRoute = (path: string) => {
    if (path === "/faculty/dashboard") {
      return (
        location.pathname === "/faculty/dashboard" || location.pathname === "/"
      );
    }
    return location.pathname === path;
  };

  return (
    <div className="w-full bg-sidebar border-r border-sidebar-border h-full flex flex-col justify-start">
      {/* Menu Items */}
      <nav className="px-4 pt-0 space-y-1 flex-1 flex flex-col justify-start overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={cn(
              "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
              isActiveRoute(item.path) &&
              "bg-sidebar-primary text-sidebar-primary-foreground font-medium",
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default FacultySidebar;
