import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  BarChart3,
  Calendar,
  FileText,
  GraduationCap,
  User,
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

const StudentSidebar = () => {
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
      label: "Courses",
      path: "/student/courses",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: "Schedule",
      path: "/student/schedule",
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
      icon: <GraduationCap className="w-5 h-5" />,
      label: "Upcoming Exams",
      path: "/student/exams",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: "Attendance",
      path: "/student/attendance",
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
    <div className="w-64 bg-sidebar border-r border-sidebar-border min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-3 -mb-px border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-sidebar-foreground">CampVerse</span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2 flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
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

      {/* Logout Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default StudentSidebar;
