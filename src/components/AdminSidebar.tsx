import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  CalendarDays,
  UsersRound,
  Settings,
  BarChart3,
  LogOut,
  Bell,
  FileText,
  Shield,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  onClose?: () => void;
  isOpen?: boolean;
}

const AdminSidebar = ({ onClose, isOpen }: AdminSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: "Attendance",
      path: "/admin/attendance",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Students",
      path: "/admin/students",
    },
    {
      icon: <GraduationCap className="w-5 h-5" />,
      label: "Faculty",
      path: "/admin/faculty",
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      label: "Placement",
      path: "/admin/placement",
    },
    {
      icon: <CalendarDays className="w-5 h-5" />,
      label: "Events",
      path: "/admin/event",
    },
    {
      icon: <UsersRound className="w-5 h-5" />,
      label: "Clubs",
      path: "/admin/club",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Exams",
      path: "/admin/exam",
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: "Alerts",
      path: "/admin/alerts",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: "Analytics",
      path: "/admin/analytics",
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      path: "/admin/settings",
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
    return location.pathname === path;
  };

  const handleNavClick = () => {
    // Close sidebar when navigation item is clicked (for mobile/overlay mode)
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-full flex flex-col">
      {/* Menu Items - No header, just navigation */}
      <nav className="p-4 pt-6 space-y-1 flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={cn(
              "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200",
              isActiveRoute(item.path) &&
              "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm",
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

export default AdminSidebar;
