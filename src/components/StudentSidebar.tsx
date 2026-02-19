import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  BarChart3,
  FileText,
  Menu,
  LogOut,
  Building2,
  CalendarDays,
  Users,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface StudentSidebarProps {
  onNavigate?: () => void;
}

const StudentSidebar = ({ onNavigate }: StudentSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
      path: "/",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "My Courses",
      path: "/student/courses",
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      label: "Placement",
      path: "/student/placement",
    },
    {
      icon: <CalendarDays className="w-5 h-5" />,
      label: "Events",
      path: "/student/events",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Clubs",
      path: "/student/clubs",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: "Results Summary",
      path: "/student/results",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Assignments",
      path: "/student/assignments",
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: "Fees",
      path: "/student/fees",
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
    if (path === "/") {
      return (
        location.pathname === "/" || location.pathname === "/student/dashboard"
      );
    }
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-full flex flex-col">
      {/* Menu Items */}
      <nav className="px-4 space-y-1 flex-1">
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

export default StudentSidebar;
