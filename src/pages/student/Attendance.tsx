import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentLayout from "@/components/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  RefreshCw,
  BookOpen,
  Trophy,
  Sparkles,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  AttendanceStatus,
  SubjectAttendanceSummary,
  AttendanceCategory,
  ATTENDANCE_THRESHOLDS,
} from "@/types/attendance";
import {
  getServerTime,
  formatDate,
  getSubjectWiseAttendance,
  calculateFourWeekAttendance,
  subscribeToStudentAttendance,
} from "@/services/attendanceService";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const StudentAttendance = () => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState("academic");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverTime, setServerTime] = useState<Date>(new Date());

  // Attendance Data
  const [subjectAttendance, setSubjectAttendance] = useState<SubjectAttendanceSummary[]>([]);
  const [overallSummary, setOverallSummary] = useState({
    academic: { totalClasses: 0, attended: 0, percentage: 0 },
    events: { totalSessions: 0, attended: 0, percentage: 0 },
    sports: { totalSessions: 0, attended: 0, percentage: 0 },
    clubs: { totalMeetings: 0, attended: 0, percentage: 0 },
  });

  // Sync server time
  useEffect(() => {
    const syncTime = async () => {
      const time = await getServerTime();
      setServerTime(time);
    };

    syncTime();
    const interval = setInterval(syncTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load attendance data
  useEffect(() => {
    loadAttendanceData();
  }, [userData?.collegeId]);

  const loadAttendanceData = async () => {
    if (!userData?.collegeId) return;

    setIsRefreshing(true);
    try {
      const section = userData.section || "A";
      const branch = userData.branch || "05";
      const year = userData.year || "22";

      // Get subject-wise attendance
      const subjectData = await getSubjectWiseAttendance(
        userData.collegeId,
        year,
        branch,
        section
      );
      setSubjectAttendance(subjectData);

      // Calculate overall
      if (subjectData.length > 0) {
        const totalClasses = subjectData.reduce((sum, s) => sum + s.totalClasses, 0);
        const attended = subjectData.reduce((sum, s) => sum + s.attended, 0);
        const percentage = totalClasses > 0
          ? Math.round((attended / totalClasses) * 100)
          : 0;

        setOverallSummary(prev => ({
          ...prev,
          academic: { totalClasses, attended, percentage },
        }));
      }

      // Get 4-week summary
      const fourWeekSummary = await calculateFourWeekAttendance(
        userData.collegeId,
        year,
        branch,
        section
      );

      if (fourWeekSummary) {
        setOverallSummary(prev => ({
          ...prev,
          academic: {
            totalClasses: fourWeekSummary.totalClasses,
            attended: fourWeekSummary.attended,
            percentage: fourWeekSummary.percentage,
          },
        }));
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshAttendance = async () => {
    await loadAttendanceData();
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= ATTENDANCE_THRESHOLDS.SATISFACTORY) return "text-green-500";
    if (percentage >= ATTENDANCE_THRESHOLDS.WARNING) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= ATTENDANCE_THRESHOLDS.SATISFACTORY) return "bg-green-500";
    if (percentage >= ATTENDANCE_THRESHOLDS.WARNING) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SATISFACTORY":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Satisfactory</Badge>;
      case "WARNING":
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Warning</Badge>;
      case "CRITICAL":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Mock chart data
  const monthlyData = [
    { month: "Oct", attendance: 85, average: 78 },
    { month: "Nov", attendance: 82, average: 76 },
    { month: "Dec", attendance: 88, average: 80 },
    { month: "Jan", attendance: 86, average: 79 },
    { month: "Feb", attendance: 84, average: 77 },
    { month: "Mar", attendance: 89, average: 81 },
  ];

  const pieData = [
    { name: "Present", value: overallSummary.academic.attended, color: "#22c55e" },
    { name: "Absent", value: overallSummary.academic.totalClasses - overallSummary.academic.attended, color: "#ef4444" },
  ];

  return (
    <StudentLayout>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Attendance Summary
              </h1>
              <p className="text-muted-foreground">
                Track your attendance across all categories
              </p>
            </div>
            <Button
              variant="outline"
              onClick={refreshAttendance}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>

          {/* Overall Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-border/50 bg-gradient-to-br from-blue-500/10 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Academic</p>
                    <p className={cn("text-2xl font-bold", getStatusColor(overallSummary.academic.percentage))}>
                      {overallSummary.academic.percentage}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {overallSummary.academic.attended}/{overallSummary.academic.totalClasses} classes
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-purple-500/10 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Events</p>
                    <p className="text-2xl font-bold text-purple-500">
                      {overallSummary.events.percentage}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {overallSummary.events.attended}/{overallSummary.events.totalSessions} events
                    </p>
                  </div>
                  <Sparkles className="w-8 h-8 text-purple-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-green-500/10 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sports</p>
                    <p className="text-2xl font-bold text-green-500">
                      {overallSummary.sports.percentage}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {overallSummary.sports.attended}/{overallSummary.sports.totalSessions} sessions
                    </p>
                  </div>
                  <Trophy className="w-8 h-8 text-green-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-orange-500/10 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Clubs</p>
                    <p className="text-2xl font-bold text-orange-500">
                      {overallSummary.clubs.percentage}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {overallSummary.clubs.attended}/{overallSummary.clubs.totalMeetings} meetings
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-orange-500/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>

            {/* Academic Attendance Tab */}
            <TabsContent value="academic" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Subject-wise Attendance */}
                <Card className="lg:col-span-2 border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Subject-wise Attendance
                    </CardTitle>
                    <CardDescription>
                      Your attendance breakdown by subject for the current semester
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {subjectAttendance.map((subject, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-foreground">
                                {subject.subjectName}
                              </span>
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  "text-lg font-bold",
                                  getStatusColor(subject.percentage)
                                )}>
                                  {subject.percentage}%
                                </span>
                                {getStatusBadge(subject.status)}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {subject.subjectCode} • {subject.attended}/{subject.totalClasses} classes
                            </div>
                          </div>
                        </div>
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                              getProgressColor(subject.percentage)
                            )}
                            style={{ width: `${subject.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card className="border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Attendance Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">Present</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm">Absent</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Comparison Tab */}
            <TabsContent value="comparison" className="space-y-6">
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Attendance Comparison
                  </CardTitle>
                  <CardDescription>
                    Your attendance vs class average over the past 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="attendance" fill="#3b82f6" name="Your Attendance" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="average" fill="#9ca3af" name="Class Average" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm">Your Attendance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      <span className="text-sm">Class Average</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Calendar View Tab */}
            <TabsContent value="calendar" className="space-y-6">
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Calendar View
                  </CardTitle>
                  <CardDescription>
                    View your attendance history by date
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Calendar view coming soon</p>
                    <p className="text-sm mt-2">
                      You'll be able to view your attendance history on a calendar
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Warning Alert for Low Attendance */}
          {overallSummary.academic.percentage < ATTENDANCE_THRESHOLDS.SATISFACTORY && (
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-500">Attendance Warning</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your attendance is below the minimum threshold of {ATTENDANCE_THRESHOLDS.SATISFACTORY}%.
                      Please ensure regular attendance to avoid detention.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Required: {ATTENDANCE_THRESHOLDS.SATISFACTORY}% |
                      Current: {overallSummary.academic.percentage}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}    </StudentLayout>  );
};

export default StudentAttendance;
