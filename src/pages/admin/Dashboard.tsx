import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Settings,
  Search,
  UserPlus,
  Download,
  BarChart3,
  Shield,
  Database,
  Bell,
} from "lucide-react";

const AdminDashboard = () => {
  const { userData, logout } = useAuth();

  const stats = [
    {
      label: "Total Students",
      value: "1,234",
      icon: <GraduationCap className="w-5 h-5" />,
      color: "text-blue-500",
      change: "+12%",
      changeType: "positive",
    },
    {
      label: "Faculty Members",
      value: "89",
      icon: <Users className="w-5 h-5" />,
      color: "text-green-500",
      change: "+3%",
      changeType: "positive",
    },
    {
      label: "Active Courses",
      value: "156",
      icon: <BookOpen className="w-5 h-5" />,
      color: "text-purple-500",
      change: "+8%",
      changeType: "positive",
    },
    {
      label: "System Uptime",
      value: "99.9%",
      icon: <Shield className="w-5 h-5" />,
      color: "text-emerald-500",
      change: "Stable",
      changeType: "neutral",
    },
  ];

  const recentActivities = [
    {
      action: "New student registered",
      user: "22B81A05C4",
      time: "2 minutes ago",
      type: "user",
    },
    {
      action: "Course updated",
      user: "Dr. Jane Smith",
      time: "15 minutes ago",
      type: "course",
    },
    {
      action: "System backup completed",
      user: "System",
      time: "1 hour ago",
      type: "system",
    },
    {
      action: "New faculty added",
      user: "22B81Z05F2",
      time: "2 hours ago",
      type: "user",
    },
    {
      action: "Assignment created",
      user: "Dr. Michael Brown",
      time: "3 hours ago",
      type: "assignment",
    },
  ];

  const quickActions = [
    {
      title: "Add New User",
      description: "Create student or faculty account",
      icon: <UserPlus className="w-5 h-5" />,
      color: "bg-blue-500",
    },
    {
      title: "Generate Reports",
      description: "Export system analytics",
      icon: <Download className="w-5 h-5" />,
      color: "bg-green-500",
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: <Settings className="w-5 h-5" />,
      color: "bg-purple-500",
    },
    {
      title: "Backup Database",
      description: "Create system backup",
      icon: <Database className="w-5 h-5" />,
      color: "bg-orange-500",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return <Users className="w-4 h-4 text-blue-500" />;
      case "course":
        return <BookOpen className="w-4 h-4 text-green-500" />;
      case "system":
        return <Settings className="w-4 h-4 text-gray-500" />;
      case "assignment":
        return <Calendar className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-foreground">CampVerse Admin</h1>
                <p className="text-xs text-muted-foreground">
                  System Administration
                </p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users, courses..."
                className="pl-10 w-64"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              System Online
            </Badge>
            <div className="text-right">
              <div className="font-medium text-foreground">
                {userData?.name || "Administrator"}
              </div>
              <div className="text-sm text-muted-foreground">
                {userData?.email || "admin@cvr.ac.in"}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Welcome back, Administrator! 👋
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening in your CampVerse system today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p
                      className={`text-xs ${
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : stat.changeType === "negative"
                            ? "text-red-600"
                            : "text-gray-600"
                      }`}
                    >
                      {stat.change}
                    </p>
                  </div>
                  <div className={`${stat.color}`}>{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 hover:shadow-md transition-all"
                  >
                    <div
                      className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center text-white`}
                    >
                      {action.icon}
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="mt-1">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4" size="sm">
                View All Activities
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">45GB</div>
                <div className="text-sm text-muted-foreground">
                  Storage Used
                </div>
                <div className="text-xs text-green-600">68% of 66GB</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600">24/7</div>
                <div className="text-sm text-muted-foreground">
                  Server Status
                </div>
                <div className="text-xs text-green-600">
                  All systems operational
                </div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">1.2K</div>
                <div className="text-sm text-muted-foreground">
                  Active Sessions
                </div>
                <div className="text-xs text-green-600">
                  +15% from yesterday
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
