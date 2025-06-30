import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const StudentSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
      path: "/student/dashboard",
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
  ];

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border min-h-screen">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-sidebar-foreground">CampVerse</span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
              location.pathname === item.path &&
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
