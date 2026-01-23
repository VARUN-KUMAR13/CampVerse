import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  Clock,
  Users,
  BarChart3,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { database, isDevelopment, firebaseReady } from "@/lib/firebase";
import { ref, onValue, off, get } from "firebase/database";
import {
  AttendanceRecord,
  AttendanceStatus,
  DailyScheduleItem,
  SubjectAttendanceSummary,
  ATTENDANCE_THRESHOLDS,
} from "@/types/attendance";
import {
  formatDate,
  formatTime,
  getServerTime,
  isSlotOpen,
  subscribeToStudentAttendance,
} from "@/services/attendanceService";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const StudentDashboard = () => {
  const { userData } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [studentName, setStudentName] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverTime, setServerTime] = useState<Date>(new Date());

  // Attendance State
  const [todaySchedule, setTodaySchedule] = useState<DailyScheduleItem[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<SubjectAttendanceSummary[]>([]);
  const [overallAttendance, setOverallAttendance] = useState({
    percentage: 0,
    totalClasses: 0,
    attended: 0,
  });

  // Fetch student name from Firebase Realtime Database
  useEffect(() => {
    if (!userData?.collegeId) return;

    const fetchStudentName = async () => {
      try {
        const response = await fetch(
          `https://campverse-1374-default-rtdb.firebaseio.com/.json`
        );

        if (response.ok) {
          const allData = await response.json();

          if (allData) {
            for (const key in allData) {
              const student = allData[key];
              if (student && student["ROLL NO"] === userData.collegeId) {
                const name = student["Name of the student"] || student["Name"] || student["name"] || null;
                if (name) {
                  setStudentName(name);
                }
                break;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching from Firebase:", error);
      }
    };

    fetchStudentName();
  }, [userData?.collegeId]);

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

  // Initialize today's schedule with default data
  useEffect(() => {
    const currentTime = formatTime(serverTime);

    const initialSchedule: DailyScheduleItem[] = [
      {
        slotId: "slot_1",
        slotNumber: 1,
        time: "9:00 AM - 12:10 PM",
        subjectCode: "22CS401",
        subjectName: "Linux programming",
        status: "NOT_MARKED",
        isSlotOpen: isSlotOpen(currentTime, "12:10", 15),
        canMark: false,
      },
      {
        slotId: "slot_2",
        slotNumber: 2,
        time: "12:10 PM - 1:10 PM",
        subjectCode: "22HS301",
        subjectName: "Business Economics and Financial Analysis",
        status: "NOT_MARKED",
        isSlotOpen: isSlotOpen(currentTime, "13:10", 15),
        canMark: false,
      },
      {
        slotId: "slot_3",
        slotNumber: 3,
        time: "1:55 PM - 2:55 PM",
        subjectCode: "22HS501",
        subjectName: "Professional Elective-lll",
        status: "NOT_MARKED",
        isSlotOpen: isSlotOpen(currentTime, "14:55", 15),
        canMark: false,
      },
      {
        slotId: "slot_4",
        slotNumber: 4,
        time: "2:55 PM - 3:55 PM",
        subjectCode: "22HS601",
        subjectName: "Professional Elective-lV",
        status: "NOT_MARKED",
        isSlotOpen: isSlotOpen(currentTime, "15:55", 15),
        canMark: false,
      },
    ];

    setTodaySchedule(initialSchedule);
  }, [serverTime]);

  // Real-time attendance subscription
  useEffect(() => {
    if (!userData?.collegeId) return;

    const today = formatDate(serverTime);
    const section = userData.section || "A";
    const branch = userData.branch || "05";
    const year = userData.year || "22";

    // Subscribe to real-time attendance updates
    const unsubscribe = subscribeToStudentAttendance(
      userData.collegeId,
      today,
      year,
      branch,
      section,
      (records) => {
        // Update schedule with attendance status
        setTodaySchedule((prev) =>
          prev.map((item) => {
            const record = records.find((r) => r.slotId === item.slotId);
            if (record) {
              return {
                ...item,
                status: record.status,
                markedAt: record.markedAt,
                markedBy: record.markedBy,
              };
            }
            return item;
          })
        );
      }
    );

    return () => unsubscribe();
  }, [userData?.collegeId, userData?.section, userData?.branch, userData?.year, serverTime]);

  // Load performance metrics
  useEffect(() => {
    // In a real app, this would fetch from Firebase
    const mockMetrics: SubjectAttendanceSummary[] = [
      {
        subjectCode: "22CS401",
        subjectName: "Linux Programming Attendance",
        totalClasses: 30,
        attended: 24,
        percentage: 78,
        status: "SATISFACTORY",
      },
      {
        subjectCode: "22HS301",
        subjectName: "Business Economics and Financial Analysis Attendance",
        totalClasses: 28,
        attended: 21,
        percentage: 75,
        status: "SATISFACTORY",
      },
      {
        subjectCode: "22HS501",
        subjectName: "Proffesional Elective - lll",
        totalClasses: 25,
        attended: 20,
        percentage: 80,
        status: "SATISFACTORY",
      },
      {
        subjectCode: "22HS601",
        subjectName: "Proffesional Elective - lV",
        totalClasses: 22,
        attended: 15,
        percentage: 70,
        status: "WARNING",
      },
    ];

    setPerformanceMetrics(mockMetrics);

    // Calculate overall
    const total = mockMetrics.reduce((sum, m) => sum + m.totalClasses, 0);
    const attended = mockMetrics.reduce((sum, m) => sum + m.attended, 0);
    setOverallAttendance({
      totalClasses: total,
      attended,
      percentage: total > 0 ? Math.round((attended / total) * 100) : 0,
    });
  }, []);

  const refreshAttendance = async () => {
    setIsRefreshing(true);
    try {
      // Sync server time
      const time = await getServerTime();
      setServerTime(time);

      // The subscription will automatically update the data
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error refreshing attendance:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "PRESENT":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Present
          </Badge>
        );
      case "ABSENT":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Absent
          </Badge>
        );
      case "LATE":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Late
          </Badge>
        );
      case "EXCUSED":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Excused
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Not Marked
          </Badge>
        );
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= ATTENDANCE_THRESHOLDS.SATISFACTORY) return "bg-green-500";
    if (percentage >= ATTENDANCE_THRESHOLDS.WARNING) return "bg-yellow-500";
    return "bg-red-500";
  };

  const stats = [
    {
      label: "Current Semester",
      value: "VII",
      icon: <BarChart3 className="w-4 h-4" />,
      color: "text-orange-500",
    },
    {
      label: "Subjects",
      value: "5",
      icon: <Users className="w-4 h-4" />,
      color: "text-green-500",
    },
    {
      label: "Labs",
      value: "3",
      icon: <CalendarIcon className="w-4 h-4" />,
      color: "text-blue-500",
    },
    {
      label: "Faculty",
      value: "12",
      icon: <Users className="w-4 h-4" />,
      color: "text-purple-500",
    },
  ];

  const upcomingEvents = [
    {
      date: "16.06.2025",
      title: "Commencement of Classwork",
      timeLeft: "Starts",
      color: "bg-green-500",
    },
    {
      date: "07.09.2025 to 17.09.2025",
      title: "I Mid Examinations",
      timeLeft: "1 Week",
      color: "bg-blue-500",
    },
    {
      date: "22.10.2025 to 25.10.2025",
      title: "II Mid Examinations",
      timeLeft: "4 Days",
      color: "bg-purple-500",
    },
    {
      date: "27.10.2025 to 01.11.2025",
      title: "Practical Exams & Preparation Holidays",
      timeLeft: "1 Week",
      color: "bg-indigo-500",
    },
    {
      date: "03.11.2025 to 17.11.2025",
      title: "Dussehra Holidays",
      timeLeft: "2 Weeks",
      color: "bg-yellow-500",
    },
    {
      date: "03.11.2025 to 17.11.2025",
      title: "Semester End Examinations (Main) & Supplementary",
      timeLeft: "2 Weeks",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />

      <div className="flex-1 flex flex-col">
        <StudentTopbar studentId={userData?.collegeId || ""} />

        <main className="flex-1 p-6 space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Hello <span className="text-primary">{studentName || userData?.collegeId}</span> <span className="text-2xl">👋</span>
            </h1>
            <p className="text-muted-foreground">
              Let's learn something new today!
            </p>
          </div>

          {/* Today's Schedule & Attendance */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Today's Schedule & Attendance</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Real-time attendance updates • Last synced: {serverTime.toLocaleTimeString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshAttendance}
                  disabled={isRefreshing}
                  className="gap-2"
                >
                  <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaySchedule.map((item) => (
                  <div
                    key={item.slotId}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg transition-all duration-300",
                      "bg-muted/30 hover:bg-muted/50",
                      item.status === "PRESENT" && "border-l-4 border-l-green-500 bg-green-500/5",
                      item.status === "ABSENT" && "border-l-4 border-l-red-500 bg-red-500/5",
                      item.status === "LATE" && "border-l-4 border-l-yellow-500 bg-yellow-500/5",
                    )}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {item.subjectName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.subjectCode}
                      </div>
                    </div>
                    <div className="text-center mx-4">
                      <div className="text-sm text-muted-foreground">
                        {item.time}
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                ))}
              </div>

              {/* Overall Attendance Summary */}
              <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Overall Attendance Today</h4>
                    <p className="text-sm text-muted-foreground">
                      {todaySchedule.filter(s => s.status === "PRESENT").length} of {todaySchedule.length} classes attended
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-2xl font-bold",
                      todaySchedule.filter(s => s.status === "PRESENT").length === todaySchedule.length
                        ? "text-green-500"
                        : "text-yellow-500"
                    )}>
                      {todaySchedule.filter(s => s.status !== "NOT_MARKED").length > 0
                        ? Math.round(
                          (todaySchedule.filter(s => s.status === "PRESENT").length /
                            todaySchedule.filter(s => s.status !== "NOT_MARKED").length) *
                          100
                        )
                        : 0}%
                    </span>
                    <p className="text-xs text-muted-foreground">marked classes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <Card key={index} className="text-center border-border/50 hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className={`text-2xl font-bold ${stat.color} mb-2`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Performance Metrics */}
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Performance Metrics</CardTitle>
                    <Badge
                      variant="outline"
                      className={cn(
                        overallAttendance.percentage >= 75
                          ? "text-green-500 border-green-500"
                          : "text-yellow-500 border-yellow-500"
                      )}
                    >
                      Overall: {overallAttendance.percentage}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-foreground">{metric.subjectName}</span>
                        <span className={cn(
                          "font-medium",
                          metric.percentage >= 75 ? "text-green-500" :
                            metric.percentage >= 65 ? "text-yellow-500" : "text-red-500"
                        )}>
                          {metric.percentage}%
                        </span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                            getProgressColor(metric.percentage)
                          )}
                          style={{ width: `${metric.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{metric.attended}/{metric.totalClasses} classes</span>
                        <span className={cn(
                          metric.status === "SATISFACTORY" ? "text-green-500" :
                            metric.status === "WARNING" ? "text-yellow-500" : "text-red-500"
                        )}>
                          {metric.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Calendar & Events */}
            <div className="space-y-6">
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                  />
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Academic Calendar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingEvents.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${event.color}`}
                      ></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">
                          {event.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.date}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {event.timeLeft}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
