import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { usePlacement } from "@/contexts/PlacementContext";
import { useToast } from "@/hooks/use-toast";
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
  Loader2,
  Clock,
  X,
  Link,
  FileText,
  Trophy,
  Users as UsersIcon,
} from "lucide-react";
import { useEvents } from "@/contexts/EventContext";
import { useClubs } from "@/contexts/ClubContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useExams } from "@/contexts/ExamContext";

interface AttachedFile {
  name: string;
  url: string;
  type: "local" | "drive";
  size?: number;
}

const AdminDashboard = () => {
  const { userData, logout } = useAuth();
  const { addJob } = usePlacement();
  const { addEvent } = useEvents();
  const { addClub } = useClubs();
  const { sendNotification } = useNotifications();
  const { addExam } = useExams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);


  const createEmptyExamForm = () => ({
    title: "",
    examType: "Mid-Term" as const,
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    branches: "",
    sections: "",
    years: "",
  });

  // Modal states
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isClubModalOpen, setIsClubModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isJobSubmitting, setIsJobSubmitting] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [driveLink, setDriveLink] = useState("");
  const [showDriveLinkInput, setShowDriveLinkInput] = useState(false);

  // Form states
  const [jobForm, setJobForm] = useState({
    job_id: "",
    company: "",
    title: "",
    type: "",
    ctc: "",
    stipend: "",
    deadlineDate: "",
    deadlineTime: "",
    deadlineAmPm: "PM",
    eligibility: "",
    description: "",
    bond: "",
    rounds: "",
    location: "",
  });

  const [eventForm, setEventForm] = useState({
    event_id: "",
    title: "",
    category: "",
    date: "",
    endDate: "",
    time: "",
    endTime: "",
    venue: "",
    organizer: "",
    description: "",
    entryFee: "Free",
    maxParticipants: "",
    prizes: "",
    registrationDeadline: "",
    highlights: "",
    contactEmail: "",
    contactPhone: "",
    featured: false,
  });
  const [isEventSubmitting, setIsEventSubmitting] = useState(false);

  const [clubForm, setClubForm] = useState({
    club_id: "",
    name: "",
    category: "",
    description: "",
    foundedYear: "",
    presidentName: "",
    presidentEmail: "",
    presidentPhone: "",
    advisorName: "",
    advisorEmail: "",
    advisorDepartment: "",
    venue: "",
    meetingSchedule: "",
    membershipFee: "Free",
    maxMembers: "",
    eligibility: "All Students",
    achievements: "",
    recruitmentStatus: "Open",
    recruitmentDeadline: "",
    instagram: "",
    linkedin: "",
    website: "",
    featured: false,
  });
  const [isClubSubmitting, setIsClubSubmitting] = useState(false);

  const [examForm, setExamForm] = useState(createEmptyExamForm);

  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    urgency: "normal" as "normal" | "important" | "critical",
    targetType: "all" as "all" | "students" | "faculty" | "custom",
    category: "general" as "general" | "academic" | "placement" | "event" | "emergency",
    branches: [] as string[],
    sections: [] as string[],
    years: [] as string[],
  });
  const [isNotificationSubmitting, setIsNotificationSubmitting] = useState(false);

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
      title: "Post Upcoming Exam",
      description: "Update dashboards for targeted cohorts",
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-amber-600",
      action: () => setIsExamModalOpen(true),
    },
    {
      title: "Club",
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

  // Generate unique Job ID
  const generateJobId = () => {
    const company = jobForm.company.replace(/\s+/g, "").toUpperCase().slice(0, 6);
    const year = new Date().getFullYear();
    return `${company || "JOB"}${year}`;
  };

  // Format deadline for submit
  const formatDeadlineForSubmit = () => {
    if (!jobForm.deadlineDate || !jobForm.deadlineTime) return "";

    const [hours, minutes] = jobForm.deadlineTime.split(":");
    let hour = parseInt(hours);

    if (jobForm.deadlineAmPm === "PM" && hour !== 12) {
      hour += 12;
    } else if (jobForm.deadlineAmPm === "AM" && hour === 12) {
      hour = 0;
    }

    const formattedHour = hour.toString().padStart(2, "0");
    return `${jobForm.deadlineDate}T${formattedHour}:${minutes}:00`;
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: AttachedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      newFiles.push({
        name: file.name,
        url: url,
        type: "local",
        size: file.size,
      });
    }
    setAttachedFiles([...attachedFiles, ...newFiles]);
  };

  // Handle Google Drive link
  const handleAddDriveLink = () => {
    if (!driveLink.trim()) return;
    setAttachedFiles([
      ...attachedFiles,
      { name: "Google Drive File", url: driveLink, type: "drive" },
    ]);
    setDriveLink("");
    setShowDriveLinkInput(false);
  };

  // Remove attached file
  const removeFile = (index: number) => {
    const newFiles = [...attachedFiles];
    newFiles.splice(index, 1);
    setAttachedFiles(newFiles);
  };

  // Form handlers
  const handleJobSubmit = async () => {
    // Validate required fields
    if (!jobForm.job_id || !jobForm.title || !jobForm.company || !jobForm.type || !jobForm.ctc) {
      toast({
        title: "Missing Fields",
        description: "Please fill in Job ID, Title, Company, Type, and CTC.",
        variant: "destructive",
      });
      return;
    }

    if (!jobForm.deadlineDate || !jobForm.deadlineTime) {
      toast({
        title: "Missing Deadline",
        description: "Please set the application deadline.",
        variant: "destructive",
      });
      return;
    }

    const deadline = formatDeadlineForSubmit();

    const jobData = {
      job_id: jobForm.job_id,
      title: jobForm.title,
      company: jobForm.company,
      type: jobForm.type,
      ctc: jobForm.ctc,
      stipend: jobForm.stipend || "N/A",
      deadline,
      description: jobForm.description,
      bond: jobForm.bond,
      location: jobForm.location,
      eligibility: jobForm.eligibility ? [jobForm.eligibility] : ["All Branches"],
      rounds: jobForm.rounds ? jobForm.rounds.split(",").map((r) => r.trim()) : [],
      attachments: attachedFiles.map((f) => ({ filename: f.name, url: f.url })),
    };

    try {
      setIsJobSubmitting(true);
      console.log("Posting job to MongoDB:", jobData);
      await addJob(jobData);

      toast({
        title: "Success!",
        description: "Job posted successfully. Students can now see it!",
      });

      // Reset form
      setJobForm({
        job_id: "",
        company: "",
        title: "",
        type: "",
        ctc: "",
        stipend: "",
        deadlineDate: "",
        deadlineTime: "",
        deadlineAmPm: "PM",
        eligibility: "",
        description: "",
        bond: "",
        rounds: "",
        location: "",
      });
      setAttachedFiles([]);
      setIsJobModalOpen(false);
    } catch (err: any) {
      console.error("Error posting job:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to post job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJobSubmitting(false);
    }
  };

  // Generate unique Event ID
  const generateEventId = () => {
    const title = eventForm.title.replace(/\s+/g, "").toUpperCase().slice(0, 8);
    const year = new Date().getFullYear();
    return `${title || "EVENT"}${year}`;
  };

  const handleEventSubmit = async () => {
    // Validate required fields
    if (!eventForm.event_id || !eventForm.title || !eventForm.category || !eventForm.date || !eventForm.venue || !eventForm.organizer) {
      toast({
        title: "Missing Fields",
        description: "Please fill in Event ID, Title, Category, Date, Venue, and Organizer.",
        variant: "destructive",
      });
      return;
    }

    // Combine date and time
    let eventDate = eventForm.date;
    if (eventForm.time) {
      eventDate = `${eventForm.date}T${eventForm.time}:00`;
    }

    let eventEndDate = eventForm.endDate || eventForm.date;
    if (eventForm.endTime) {
      eventEndDate = `${eventForm.endDate || eventForm.date}T${eventForm.endTime}:00`;
    }

    const eventData = {
      event_id: eventForm.event_id,
      title: eventForm.title,
      category: eventForm.category,
      date: eventDate,
      endDate: eventEndDate,
      venue: eventForm.venue,
      organizer: eventForm.organizer,
      description: eventForm.description,
      entryFee: eventForm.entryFee || "Free",
      maxParticipants: eventForm.maxParticipants ? parseInt(eventForm.maxParticipants) : 0,
      prizes: eventForm.prizes,
      registrationDeadline: eventForm.registrationDeadline || eventForm.date,
      highlights: eventForm.highlights ? eventForm.highlights.split(",").map((h) => h.trim()) : [],
      contactEmail: eventForm.contactEmail,
      contactPhone: eventForm.contactPhone,
      featured: eventForm.featured,
      status: "Open",
    };

    try {
      setIsEventSubmitting(true);
      console.log("Creating event in MongoDB:", eventData);
      await addEvent(eventData as any);

      toast({
        title: "Success!",
        description: "Event created successfully. Students can now see it!",
      });

      // Reset form
      setEventForm({
        event_id: "",
        title: "",
        category: "",
        date: "",
        endDate: "",
        time: "",
        endTime: "",
        venue: "",
        organizer: "",
        description: "",
        entryFee: "Free",
        maxParticipants: "",
        prizes: "",
        registrationDeadline: "",
        highlights: "",
        contactEmail: "",
        contactPhone: "",
        featured: false,
      });
      setIsEventModalOpen(false);
    } catch (err: any) {
      console.error("Error creating event:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEventSubmitting(false);
    }
  };

  // Generate unique Club ID
  const generateClubId = () => {
    const name = clubForm.name.replace(/\s+/g, "").toUpperCase().slice(0, 8);
    return `${name || "CLUB"}${new Date().getFullYear()}`;
  };

  const handleClubSubmit = async () => {
    // Validate required fields
    if (!clubForm.club_id || !clubForm.name || !clubForm.category || !clubForm.description) {
      toast({
        title: "Missing Fields",
        description: "Please fill in Club ID, Name, Category, and Description.",
        variant: "destructive",
      });
      return;
    }

    const clubData = {
      club_id: clubForm.club_id,
      name: clubForm.name,
      category: clubForm.category,
      description: clubForm.description,
      foundedYear: clubForm.foundedYear ? parseInt(clubForm.foundedYear) : undefined,
      president: {
        name: clubForm.presidentName,
        email: clubForm.presidentEmail,
        phone: clubForm.presidentPhone,
      },
      faculty_advisor: {
        name: clubForm.advisorName,
        email: clubForm.advisorEmail,
        department: clubForm.advisorDepartment,
      },
      venue: clubForm.venue,
      meetingSchedule: clubForm.meetingSchedule,
      membershipFee: clubForm.membershipFee || "Free",
      maxMembers: clubForm.maxMembers ? parseInt(clubForm.maxMembers) : 0,
      eligibility: clubForm.eligibility || "All Students",
      achievements: clubForm.achievements ? clubForm.achievements.split(",").map((a) => a.trim()) : [],
      recruitmentStatus: clubForm.recruitmentStatus || "Open",
      recruitmentDeadline: clubForm.recruitmentDeadline || undefined,
      socialLinks: {
        instagram: clubForm.instagram,
        linkedin: clubForm.linkedin,
        website: clubForm.website,
      },
      featured: clubForm.featured,
      status: "Active",
    };

    try {
      setIsClubSubmitting(true);
      console.log("Creating club in MongoDB:", clubData);
      await addClub(clubData as any);

      toast({
        title: "Success!",
        description: "Club created successfully. Students can now see it!",
      });

      // Reset form
      setClubForm({
        club_id: "",
        name: "",
        category: "",
        description: "",
        foundedYear: "",
        presidentName: "",
        presidentEmail: "",
        presidentPhone: "",
        advisorName: "",
        advisorEmail: "",
        advisorDepartment: "",
        venue: "",
        meetingSchedule: "",
        membershipFee: "Free",
        maxMembers: "",
        eligibility: "All Students",
        achievements: "",
        recruitmentStatus: "Open",
        recruitmentDeadline: "",
        instagram: "",
        linkedin: "",
        website: "",
        featured: false,
      });
      setIsClubModalOpen(false);
    } catch (err: any) {
      console.error("Error creating club:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to create club. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClubSubmitting(false);
    }
  };

  const [isExamSubmitting, setIsExamSubmitting] = useState(false);

  const handleExamSubmit = async () => {
    // Validate required fields
    if (!examForm.title.trim() || !examForm.date || !examForm.startTime || !examForm.endTime) {
      toast({
        title: "Missing Fields",
        description: "Please fill in Title, Date, Start Time and End Time.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExamSubmitting(true);

      // Build target audience
      const branches = examForm.branches.split(",").map((b) => b.trim()).filter((b) => b);
      const sections = examForm.sections.split(",").map((s) => s.trim()).filter((s) => s);
      const years = examForm.years.split(",").map((y) => y.trim()).filter((y) => y);

      const examData: any = {
        exam_id: `EXAM${Date.now()}`,
        title: examForm.title,
        course: examForm.title, // Use title as course name
        examType: examForm.examType,
        date: examForm.date,
        startTime: examForm.startTime,
        endTime: examForm.endTime,
        venue: examForm.venue || undefined,
        status: "Scheduled" as const,
        postedBy: userData?.collegeId || "admin",
      };

      // Add target audience if specified
      if (branches.length || sections.length || years.length) {
        examData.targetAudience = {
          branches: branches.length ? branches : undefined,
          sections: sections.length ? sections : undefined,
          years: years.length ? years : undefined,
        };
      }

      await addExam(examData);

      toast({
        title: "Success!",
        description: "Exam scheduled successfully. Students will see it on their dashboard.",
      });

      setExamForm(createEmptyExamForm());
      setIsExamModalOpen(false);
    } catch (err: any) {
      console.error("Error scheduling exam:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to schedule exam. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExamSubmitting(false);
    }
  };

  const handleNotificationSubmit = async () => {
    // Validate required fields
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill in Title and Message.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsNotificationSubmitting(true);

      // Build target audience object
      const targetAudience: any = {
        type: notificationForm.targetType,
      };

      // Add optional targeting
      if (notificationForm.targetType === 'custom') {
        if (notificationForm.branches.length > 0) {
          targetAudience.branches = notificationForm.branches;
        }
        if (notificationForm.sections.length > 0) {
          targetAudience.sections = notificationForm.sections;
        }
        if (notificationForm.years.length > 0) {
          targetAudience.years = notificationForm.years;
        }
      }

      await sendNotification({
        title: notificationForm.title,
        message: notificationForm.message,
        urgency: notificationForm.urgency,
        targetAudience,
        category: notificationForm.category,
      });

      toast({
        title: "Success!",
        description: "Notification sent successfully to targeted users.",
      });

      // Reset form
      setNotificationForm({
        title: "",
        message: "",
        urgency: "normal",
        targetType: "all",
        category: "general",
        branches: [],
        sections: [],
        years: [],
      });
      setIsNotificationModalOpen(false);
    } catch (err: any) {
      console.error("Error sending notification:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to send notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsNotificationSubmitting(false);
    }
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
                      className={`text-xs ${stat.changeType === "positive"
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
                Manage placements, exams, events, clubs, and notifications
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Building2 className="w-6 h-6 text-primary" />
                Post New Job Opportunity
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4">
              {/* Job ID and Company */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Job ID <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={jobForm.job_id}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, job_id: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g., GOOGLE2025"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setJobForm({ ...jobForm, job_id: generateJobId() })}
                    >
                      Auto
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={jobForm.company}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, company: e.target.value })
                    }
                    placeholder="e.g., Google, Microsoft"
                  />
                </div>
              </div>

              {/* Job Title */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Job Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={jobForm.title}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, title: e.target.value })
                  }
                  placeholder="e.g., Software Engineer, Data Analyst"
                />
              </div>

              {/* Job Type and CTC */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Job Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={jobForm.type}
                    onValueChange={(value) =>
                      setJobForm({ ...jobForm, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Time">Full Time</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Intern + Full Time">Intern + Full Time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    CTC / Package <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={jobForm.ctc}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, ctc: e.target.value })
                    }
                    placeholder="e.g., 12 LPA, 8-15 LPA"
                  />
                </div>
              </div>

              {/* Stipend and Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Stipend (for internship)</Label>
                  <Input
                    value={jobForm.stipend}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, stipend: e.target.value })
                    }
                    placeholder="e.g., ₹50,000/month or N/A"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Location</Label>
                  <Input
                    value={jobForm.location}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, location: e.target.value })
                    }
                    placeholder="e.g., Bangalore, Remote, Hybrid"
                  />
                </div>
              </div>

              {/* Deadline Section */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Application Deadline <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Date (DD-MM-YYYY)</Label>
                    <Input
                      type="date"
                      value={jobForm.deadlineDate}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, deadlineDate: e.target.value })
                      }
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Time (HH:MM)</Label>
                    <Input
                      type="time"
                      value={jobForm.deadlineTime}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, deadlineTime: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">AM/PM</Label>
                    <Select
                      value={jobForm.deadlineAmPm}
                      onValueChange={(value) =>
                        setJobForm({ ...jobForm, deadlineAmPm: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Job Description</Label>
                <Textarea
                  value={jobForm.description}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, description: e.target.value })
                  }
                  placeholder="Describe the role, responsibilities, requirements..."
                  rows={3}
                />
              </div>

              {/* Eligibility */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Eligible Branches</Label>
                <Select
                  value={jobForm.eligibility}
                  onValueChange={(value) =>
                    setJobForm({ ...jobForm, eligibility: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select eligible branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Branches">All Branches</SelectItem>
                    <SelectItem value="CSE">Computer Science & Engineering</SelectItem>
                    <SelectItem value="IT">Information Technology</SelectItem>
                    <SelectItem value="ECE">Electronics & Communication</SelectItem>
                    <SelectItem value="EEE">Electrical & Electronics</SelectItem>
                    <SelectItem value="MECH">Mechanical Engineering</SelectItem>
                    <SelectItem value="CIVIL">Civil Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bond and Rounds */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Bond Period</Label>
                  <Input
                    value={jobForm.bond}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, bond: e.target.value })
                    }
                    placeholder="e.g., 2 years, No Bond"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Selection Rounds</Label>
                  <Input
                    value={jobForm.rounds}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, rounds: e.target.value })
                    }
                    placeholder="e.g., Aptitude, Technical, HR"
                  />
                  <p className="text-xs text-muted-foreground">Separate with commas</p>
                </div>
              </div>

              {/* File Attachments Section */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Attachments (Job Description, Forms, etc.)
                </Label>

                {/* Attached Files List */}
                {attachedFiles.length > 0 && (
                  <div className="space-y-2">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-background rounded border"
                      >
                        <div className="flex items-center gap-2">
                          {file.type === "drive" ? (
                            <Link className="w-4 h-4 text-blue-500" />
                          ) : (
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                          {file.size && (
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Buttons */}
                <div className="flex flex-wrap gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload from Computer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDriveLinkInput(!showDriveLinkInput)}
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Add Google Drive Link
                  </Button>
                </div>

                {/* Google Drive Link Input */}
                {showDriveLinkInput && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.target.value)}
                      placeholder="Paste Google Drive link here..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddDriveLink}
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowDriveLinkInput(false);
                        setDriveLink("");
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsJobModalOpen(false)}
                  disabled={isJobSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleJobSubmit}
                  disabled={isJobSubmitting}
                  className="min-w-[120px]"
                >
                  {isJobSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Post Job
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Event Creation Modal */}
        <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <CalendarDays className="w-6 h-6 text-primary" />
                Create Campus Event
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4">
              {/* Event ID and Title */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Event ID <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={eventForm.event_id}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, event_id: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g., HACKATHON2025"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEventForm({ ...eventForm, event_id: generateEventId() })}
                    >
                      Auto
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Event Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={eventForm.title}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, title: e.target.value })
                    }
                    placeholder="e.g., CodeStorm Hackathon"
                  />
                </div>
              </div>

              {/* Category and Organizer */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={eventForm.category}
                    onValueChange={(value) =>
                      setEventForm({ ...eventForm, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="Cultural">Cultural</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Seminar">Seminar</SelectItem>
                      <SelectItem value="Competition">Competition</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Organizer <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={eventForm.organizer}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, organizer: e.target.value })
                    }
                    placeholder="e.g., IEEE Student Branch"
                  />
                </div>
              </div>

              {/* Venue */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Venue <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={eventForm.venue}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, venue: e.target.value })
                  }
                  placeholder="e.g., Main Auditorium, Computer Science Block"
                />
              </div>

              {/* Dates and Times */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Start Date & Time <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={eventForm.date}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, date: e.target.value })
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="flex-1"
                    />
                    <Input
                      type="time"
                      value={eventForm.time}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, time: e.target.value })
                      }
                      className="w-32"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    End Date & Time
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={eventForm.endDate}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, endDate: e.target.value })
                      }
                      min={eventForm.date || new Date().toISOString().split("T")[0]}
                      className="flex-1"
                    />
                    <Input
                      type="time"
                      value={eventForm.endTime}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, endTime: e.target.value })
                      }
                      className="w-32"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Event Description</Label>
                <Textarea
                  value={eventForm.description}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, description: e.target.value })
                  }
                  placeholder="Share agenda, key speakers, eligibility, and participation instructions..."
                  rows={3}
                />
              </div>

              {/* Entry Fee, Max Participants, Prizes */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Entry Fee</Label>
                  <Input
                    value={eventForm.entryFee}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, entryFee: e.target.value })
                    }
                    placeholder="Free, ₹200, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Max Participants</Label>
                  <Input
                    type="number"
                    value={eventForm.maxParticipants}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, maxParticipants: e.target.value })
                    }
                    placeholder="0 = unlimited"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    Prizes
                  </Label>
                  <Input
                    value={eventForm.prizes}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, prizes: e.target.value })
                    }
                    placeholder="₹50,000 Prize Pool"
                  />
                </div>
              </div>

              {/* Registration Deadline and Highlights */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Registration Deadline</Label>
                  <Input
                    type="date"
                    value={eventForm.registrationDeadline}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, registrationDeadline: e.target.value })
                    }
                    max={eventForm.date}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Highlights</Label>
                  <Input
                    value={eventForm.highlights}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, highlights: e.target.value })
                    }
                    placeholder="Free Food, Networking, Certificates"
                  />
                  <p className="text-xs text-muted-foreground">Separate with commas</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Contact Email</Label>
                  <Input
                    type="email"
                    value={eventForm.contactEmail}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, contactEmail: e.target.value })
                    }
                    placeholder="events@college.ac.in"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Contact Phone</Label>
                  <Input
                    value={eventForm.contactPhone}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, contactPhone: e.target.value })
                    }
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Featured Event
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Featured events are highlighted on the student dashboard
                  </p>
                </div>
                <Switch
                  checked={eventForm.featured}
                  onCheckedChange={(checked) =>
                    setEventForm({ ...eventForm, featured: checked })
                  }
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsEventModalOpen(false)}
                  disabled={isEventSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEventSubmit}
                  disabled={isEventSubmitting}
                  className="min-w-[140px]"
                >
                  {isEventSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>


        {/* Exam Scheduling Modal */}
        <Dialog open={isExamModalOpen} onOpenChange={setIsExamModalOpen}>
          <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Post Upcoming Exam
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Exam Title */}
              <div>
                <label className="text-sm font-medium">
                  Exam Title <span className="text-destructive">*</span>
                </label>
                <Input
                  value={examForm.title}
                  onChange={(e) =>
                    setExamForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., Mid Semester Examination - I"
                />
              </div>

              {/* Exam Type and Date */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Exam Type</label>
                  <Select
                    value={examForm.examType}
                    onValueChange={(value) =>
                      setExamForm((prev) => ({ ...prev, examType: value as any }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                      <SelectItem value="End-Term">End-Term</SelectItem>
                      <SelectItem value="Quiz">Quiz</SelectItem>
                      <SelectItem value="Practical">Practical</SelectItem>
                      <SelectItem value="Viva">Viva</SelectItem>
                      <SelectItem value="Assignment">Assignment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Exam Date <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="date"
                    value={examForm.date}
                    onChange={(e) =>
                      setExamForm((prev) => ({ ...prev, date: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Time and Venue */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Start Time <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="time"
                    value={examForm.startTime}
                    onChange={(e) =>
                      setExamForm((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    End Time <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="time"
                    value={examForm.endTime}
                    onChange={(e) =>
                      setExamForm((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Venue</label>
                  <Input
                    value={examForm.venue}
                    onChange={(e) =>
                      setExamForm((prev) => ({ ...prev, venue: e.target.value }))
                    }
                    placeholder="e.g., Block A, Room 101"
                  />
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Target Audience (Optional)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Leave empty to show to all students. Separate multiple entries with commas.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Branches</label>
                    <Input
                      value={examForm.branches}
                      onChange={(e) =>
                        setExamForm((prev) => ({ ...prev, branches: e.target.value }))
                      }
                      placeholder="CSE, ECE, EEE"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Sections</label>
                    <Input
                      value={examForm.sections}
                      onChange={(e) =>
                        setExamForm((prev) => ({ ...prev, sections: e.target.value }))
                      }
                      placeholder="A, B, C"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Years</label>
                    <Input
                      value={examForm.years}
                      onChange={(e) =>
                        setExamForm((prev) => ({ ...prev, years: e.target.value }))
                      }
                      placeholder="1, 2, 3, 4"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setExamForm(createEmptyExamForm());
                    setIsExamModalOpen(false);
                  }}
                  disabled={isExamSubmitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleExamSubmit} disabled={isExamSubmitting}>
                  {isExamSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Exam"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>


        {/* Club Addition Modal */}
        <Dialog open={isClubModalOpen} onOpenChange={setIsClubModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <UsersRound className="w-6 h-6 text-primary" />
                Register New Club
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4">
              {/* Club ID and Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Club ID <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={clubForm.club_id}
                      onChange={(e) =>
                        setClubForm({ ...clubForm, club_id: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g., IEEE2025"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setClubForm({ ...clubForm, club_id: generateClubId() })}
                    >
                      Auto
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Club Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={clubForm.name}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, name: e.target.value })
                    }
                    placeholder="e.g., IEEE Student Branch"
                  />
                </div>
              </div>

              {/* Category and Founded Year */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Category <span className="text-destructive">*</span>
                  </Label>
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
                      <SelectItem value="Literary">Literary</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Hobby">Hobby</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Founded Year</Label>
                  <Input
                    type="number"
                    value={clubForm.foundedYear}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, foundedYear: e.target.value })
                    }
                    placeholder="e.g., 2020"
                    min={1990}
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  value={clubForm.description}
                  onChange={(e) =>
                    setClubForm({ ...clubForm, description: e.target.value })
                  }
                  placeholder="Club objectives, activities, achievements..."
                  rows={3}
                />
              </div>

              {/* President Info */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">President Details</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    value={clubForm.presidentName}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, presidentName: e.target.value })
                    }
                    placeholder="President Name"
                  />
                  <Input
                    type="email"
                    value={clubForm.presidentEmail}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, presidentEmail: e.target.value })
                    }
                    placeholder="president@email.com"
                  />
                  <Input
                    value={clubForm.presidentPhone}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, presidentPhone: e.target.value })
                    }
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              {/* Faculty Advisor Info */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Faculty Advisor</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    value={clubForm.advisorName}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, advisorName: e.target.value })
                    }
                    placeholder="Advisor Name"
                  />
                  <Input
                    type="email"
                    value={clubForm.advisorEmail}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, advisorEmail: e.target.value })
                    }
                    placeholder="advisor@college.ac.in"
                  />
                  <Input
                    value={clubForm.advisorDepartment}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, advisorDepartment: e.target.value })
                    }
                    placeholder="Department"
                  />
                </div>
              </div>

              {/* Venue and Meeting Schedule */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Venue</Label>
                  <Input
                    value={clubForm.venue}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, venue: e.target.value })
                    }
                    placeholder="Room 201, CS Block"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Meeting Schedule</Label>
                  <Input
                    value={clubForm.meetingSchedule}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, meetingSchedule: e.target.value })
                    }
                    placeholder="Every Saturday, 3 PM"
                  />
                </div>
              </div>

              {/* Membership Fee, Max Members, Eligibility */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Membership Fee</Label>
                  <Input
                    value={clubForm.membershipFee}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, membershipFee: e.target.value })
                    }
                    placeholder="Free, ₹500/year"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Max Members</Label>
                  <Input
                    type="number"
                    value={clubForm.maxMembers}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, maxMembers: e.target.value })
                    }
                    placeholder="0 = unlimited"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Eligibility</Label>
                  <Input
                    value={clubForm.eligibility}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, eligibility: e.target.value })
                    }
                    placeholder="All Students"
                  />
                </div>
              </div>

              {/* Achievements and Recruitment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Achievements</Label>
                  <Input
                    value={clubForm.achievements}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, achievements: e.target.value })
                    }
                    placeholder="Winners of XYZ, National Award"
                  />
                  <p className="text-xs text-muted-foreground">Separate with commas</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Recruitment Status</Label>
                  <Select
                    value={clubForm.recruitmentStatus}
                    onValueChange={(value) =>
                      setClubForm({ ...clubForm, recruitmentStatus: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                      <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Social Links</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    value={clubForm.instagram}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, instagram: e.target.value })
                    }
                    placeholder="Instagram URL"
                  />
                  <Input
                    value={clubForm.linkedin}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, linkedin: e.target.value })
                    }
                    placeholder="LinkedIn URL"
                  />
                  <Input
                    value={clubForm.website}
                    onChange={(e) =>
                      setClubForm({ ...clubForm, website: e.target.value })
                    }
                    placeholder="Website URL"
                  />
                </div>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Featured Club
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Featured clubs are highlighted on the student dashboard
                  </p>
                </div>
                <Switch
                  checked={clubForm.featured}
                  onCheckedChange={(checked) =>
                    setClubForm({ ...clubForm, featured: checked })
                  }
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsClubModalOpen(false)}
                  disabled={isClubSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleClubSubmit}
                  disabled={isClubSubmitting}
                  className="min-w-[140px]"
                >
                  {isClubSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Register Club
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notification Modal */}
        <Dialog
          open={isNotificationModalOpen}
          onOpenChange={setIsNotificationModalOpen}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Bell className="w-6 h-6 text-primary" />
                Send Notification Alert
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4">
              {/* Title */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Alert Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={notificationForm.title}
                  onChange={(e) =>
                    setNotificationForm({ ...notificationForm, title: e.target.value })
                  }
                  placeholder="e.g., Important: Exam Schedule Update"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  value={notificationForm.message}
                  onChange={(e) =>
                    setNotificationForm({ ...notificationForm, message: e.target.value })
                  }
                  placeholder="Enter your notification message..."
                  rows={4}
                />
              </div>

              {/* Urgency and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Urgency Level</Label>
                  <Select
                    value={notificationForm.urgency}
                    onValueChange={(value: "normal" | "important" | "critical") =>
                      setNotificationForm({ ...notificationForm, urgency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="critical">Critical/Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Category</Label>
                  <Select
                    value={notificationForm.category}
                    onValueChange={(value: "general" | "academic" | "placement" | "event" | "emergency") =>
                      setNotificationForm({ ...notificationForm, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="placement">Placement</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Target Audience</Label>
                <Select
                  value={notificationForm.targetType}
                  onValueChange={(value: "all" | "students" | "faculty" | "custom") =>
                    setNotificationForm({ ...notificationForm, targetType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="students">All Students</SelectItem>
                    <SelectItem value="faculty">All Faculty</SelectItem>
                    <SelectItem value="custom">Custom (Specific Branches/Sections)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Targeting Options */}
              {notificationForm.targetType === "custom" && (
                <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20">
                  <p className="text-sm font-medium text-foreground">Custom Targeting Options</p>

                  {/* Branches */}
                  <div className="space-y-2">
                    <Label className="text-sm">Branches (comma-separated)</Label>
                    <Input
                      value={notificationForm.branches.join(", ")}
                      onChange={(e) =>
                        setNotificationForm({
                          ...notificationForm,
                          branches: e.target.value.split(",").map((b) => b.trim()).filter((b) => b),
                        })
                      }
                      placeholder="e.g., CSE, ECE, EEE"
                    />
                    <p className="text-xs text-muted-foreground">Leave empty to include all branches</p>
                  </div>

                  {/* Sections */}
                  <div className="space-y-2">
                    <Label className="text-sm">Sections (comma-separated)</Label>
                    <Input
                      value={notificationForm.sections.join(", ")}
                      onChange={(e) =>
                        setNotificationForm({
                          ...notificationForm,
                          sections: e.target.value.split(",").map((s) => s.trim()).filter((s) => s),
                        })
                      }
                      placeholder="e.g., A, B, C"
                    />
                    <p className="text-xs text-muted-foreground">Leave empty to include all sections</p>
                  </div>

                  {/* Years */}
                  <div className="space-y-2">
                    <Label className="text-sm">Years (comma-separated)</Label>
                    <Input
                      value={notificationForm.years.join(", ")}
                      onChange={(e) =>
                        setNotificationForm({
                          ...notificationForm,
                          years: e.target.value.split(",").map((y) => y.trim()).filter((y) => y),
                        })
                      }
                      placeholder="e.g., 1, 2, 3, 4"
                    />
                    <p className="text-xs text-muted-foreground">Leave empty to include all years</p>
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Real-time Sync
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This notification will be sent instantly via Firebase to all targeted users
                  </p>
                </div>
                <Bell className="w-5 h-5 text-primary animate-pulse" />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsNotificationModalOpen(false)}
                  disabled={isNotificationSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleNotificationSubmit}
                  disabled={isNotificationSubmitting}
                  className="min-w-[140px]"
                >
                  {isNotificationSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Alert
                    </>
                  )}
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
