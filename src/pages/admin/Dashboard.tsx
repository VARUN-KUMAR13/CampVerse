import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Building2,
  CalendarDays,
  UsersRound,
  MessageSquare,
  Plus,
  Upload,
  Send,
} from "lucide-react";

const AdminDashboard = () => {
  const { userData, logout } = useAuth();

  // Modal states
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isClubModalOpen, setIsClubModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Form states
  const [jobForm, setJobForm] = useState({
    company: "",
    title: "",
    type: "",
    ctc: "",
    deadline: "",
    eligibility: "",
    description: "",
    targetAudience: "all",
  });

  const [eventForm, setEventForm] = useState({
    name: "",
    date: "",
    time: "",
    venue: "",
    description: "",
    entryFee: "",
    notifyAll: true,
  });

  const [clubForm, setClubForm] = useState({
    name: "",
    category: "",
    description: "",
    members: "",
    followers: "",
  });

  const [notificationForm, setNotificationForm] = useState({
    message: "",
    urgency: "normal",
    targetAudience: "all",
  });

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

  const contentHubActions = [
    {
      title: "Post New Job",
      description: "Add placement opportunity",
      icon: <Building2 className="w-5 h-5" />,
      color: "bg-blue-600",
      action: () => setIsJobModalOpen(true),
    },
    {
      title: "Create Event",
      description: "Schedule campus event",
      icon: <CalendarDays className="w-5 h-5" />,
      color: "bg-purple-600",
      action: () => setIsEventModalOpen(true),
    },
    {
      title: "Add Club",
      description: "Register new club",
      icon: <UsersRound className="w-5 h-5" />,
      color: "bg-green-600",
      action: () => setIsClubModalOpen(true),
    },
    {
      title: "Send Alert",
      description: "Push notification",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "bg-red-600",
      action: () => setIsNotificationModalOpen(true),
    },
  ];

  // Form handlers
  const handleJobSubmit = () => {
    console.log("Job posted:", jobForm);
    // API call to create job
    setJobForm({
      company: "",
      title: "",
      type: "",
      ctc: "",
      deadline: "",
      eligibility: "",
      description: "",
      targetAudience: "all",
    });
    setIsJobModalOpen(false);
  };

  const handleEventSubmit = () => {
    console.log("Event created:", eventForm);
    // API call to create event
    setEventForm({
      name: "",
      date: "",
      time: "",
      venue: "",
      description: "",
      entryFee: "",
      notifyAll: true,
    });
    setIsEventModalOpen(false);
  };

  const handleClubSubmit = () => {
    console.log("Club added:", clubForm);
    // API call to create club
    setClubForm({
      name: "",
      category: "",
      description: "",
      members: "",
      followers: "",
    });
    setIsClubModalOpen(false);
  };

  const handleNotificationSubmit = () => {
    console.log("Notification sent:", notificationForm);
    // API call to send notification
    setNotificationForm({
      message: "",
      urgency: "normal",
      targetAudience: "all",
    });
    setIsNotificationModalOpen(false);
  };

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
            Welcome back, Administrator! ��
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

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center space-y-1 hover:shadow-md transition-all"
                  >
                    <div
                      className={`w-6 h-6 ${action.color} rounded-md flex items-center justify-center text-white`}
                    >
                      {action.icon}
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-xs">{action.title}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Hub */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Content Hub
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage placements, events, clubs, and notifications
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {contentHubActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={action.action}
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
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.slice(0, 4).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="mt-1">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-3" size="sm">
                View All
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

        {/* Job Posting Modal */}
        <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Post New Job Opportunity
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Company Name</label>
                  <Input
                    value={jobForm.company}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, company: e.target.value })
                    }
                    placeholder="e.g., Google, Microsoft"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Job Title</label>
                  <Input
                    value={jobForm.title}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, title: e.target.value })
                    }
                    placeholder="Software Engineer, Data Analyst"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Job Type</label>
                  <Select
                    value={jobForm.type}
                    onValueChange={(value) =>
                      setJobForm({ ...jobForm, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Time">Full Time</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Intern + Full Time">
                        Intern + Full Time
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">CTC</label>
                  <Input
                    value={jobForm.ctc}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, ctc: e.target.value })
                    }
                    placeholder="5.00 LPA - 8.00 LPA"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Deadline</label>
                  <Input
                    type="datetime-local"
                    value={jobForm.deadline}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, deadline: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Eligibility Criteria
                </label>
                <Input
                  value={jobForm.eligibility}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, eligibility: e.target.value })
                  }
                  placeholder="CSE, IT, ECE or All Branches"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Job Description</label>
                <Textarea
                  value={jobForm.description}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, description: e.target.value })
                  }
                  placeholder="Detailed job description..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Target Audience</label>
                <Select
                  value={jobForm.targetAudience}
                  onValueChange={(value) =>
                    setJobForm({ ...jobForm, targetAudience: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="batch_2024">Batch 2024</SelectItem>
                    <SelectItem value="batch_2025">Batch 2025</SelectItem>
                    <SelectItem value="specific_branches">
                      Specific Branches
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Attach Files (PDFs)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Click to upload job description, proposal files
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsJobModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleJobSubmit}>Post Job</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Event Creation Modal */}
        <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Create Campus Event
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Event Name</label>
                <Input
                  value={eventForm.name}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, name: e.target.value })
                  }
                  placeholder="Tech Fest 2025, Cultural Night"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Time</label>
                  <Input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, time: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Entry Fee</label>
                  <Input
                    value={eventForm.entryFee}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, entryFee: e.target.value })
                    }
                    placeholder="₹200 or Free"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Venue</label>
                <Input
                  value={eventForm.venue}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, venue: e.target.value })
                  }
                  placeholder="Main Auditorium, Sports Complex"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={eventForm.description}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, description: e.target.value })
                  }
                  placeholder="Event details, activities, prizes..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notifyAll"
                  checked={eventForm.notifyAll}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, notifyAll: e.target.checked })
                  }
                />
                <label htmlFor="notifyAll" className="text-sm font-medium">
                  Notify all students
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEventModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEventSubmit}>Create Event</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Club Addition Modal */}
        <Dialog open={isClubModalOpen} onOpenChange={setIsClubModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UsersRound className="w-5 h-5" />
                Add New Club
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Club Name</label>
                <Input
                  value={clubForm.name}
                  onChange={(e) =>
                    setClubForm({ ...clubForm, name: e.target.value })
                  }
                  placeholder="ENIGMA, IEEE Society"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={clubForm.category}
                  onValueChange={(value) =>
                    setClubForm({ ...clubForm, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Arts">Arts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={clubForm.description}
                  onChange={(e) =>
                    setClubForm({ ...clubForm, description: e.target.value })
                  }
                  placeholder="Club objectives, activities..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Initial Members</label>
                  <Input
                    type="number"
                    value={clubForm.members}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, members: e.target.value })
                    }
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Initial Followers
                  </label>
                  <Input
                    type="number"
                    value={clubForm.followers}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, followers: e.target.value })
                    }
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsClubModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleClubSubmit}>Add Club</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notification Modal */}
        <Dialog
          open={isNotificationModalOpen}
          onOpenChange={setIsNotificationModalOpen}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Send Notification Alert
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={notificationForm.message}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      message: e.target.value,
                    })
                  }
                  placeholder="Important announcement, deadline reminder..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Urgency Level</label>
                  <Select
                    value={notificationForm.urgency}
                    onValueChange={(value) =>
                      setNotificationForm({
                        ...notificationForm,
                        urgency: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Target Audience</label>
                  <Select
                    value={notificationForm.targetAudience}
                    onValueChange={(value) =>
                      setNotificationForm({
                        ...notificationForm,
                        targetAudience: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="faculty">Faculty Only</SelectItem>
                      <SelectItem value="admins">Admins Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsNotificationModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleNotificationSubmit}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Alert
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminDashboard;
