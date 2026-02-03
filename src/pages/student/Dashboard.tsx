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
  AttendanceRole,
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
  resetDailyAttendance,
  studentSelfMark,
  subscribeToPerformanceMetrics,
} from "@/services/attendanceService";
import { toast } from "sonner";
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

  // Track marked by role for color coding
  const [attendanceMarkedBy, setAttendanceMarkedBy] = useState<Record<string, AttendanceRole>>({});

  // Track if student is eligible for attendance (Section B, roll range validation)
  const [isEligibleForAttendance, setIsEligibleForAttendance] = useState(false);
  const [studentSection, setStudentSection] = useState<string | null>(null);

  // Real-time performance metrics
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    totalClasses: 4,
    attended: 0,
    absent: 0,
    notMarked: 4,
    percentage: 0,
  });

  // Self-marking loading state
  const [selfMarkingSlot, setSelfMarkingSlot] = useState<string | null>(null);

  // Validate if roll number is in Section B range (22B81A0565 to 22B81A05C8)
  const isValidSectionBRollNumber = (rollNo: string): boolean => {
    // Extract the numeric part from roll number (e.g., "22B81A0565" -> "0565")
    const match = rollNo.match(/22B81A05([0-9A-F]{2})$/i);
    if (!match) return false;

    const hexValue = match[1].toUpperCase();
    const startHex = "65"; // 22B81A0565
    const endHex = "C8"; // 22B81A05C8

    // Convert hex to decimal for comparison
    const value = parseInt(hexValue, 16);
    const startValue = parseInt(startHex, 16); // 101
    const endValue = parseInt(endHex, 16); // 200

    return value >= startValue && value <= endValue;
  };

  // Fetch student name and validate section from Firebase Realtime Database
  useEffect(() => {
    if (!userData?.collegeId) return;

    const fetchStudentData = async () => {
      try {
        const response = await fetch(
          `https://campverse-2004-default-rtdb.asia-southeast1.firebasedatabase.app/.json`
        );

        if (response.ok) {
          const allData = await response.json();

          if (allData) {
            for (const key in allData) {
              const student = allData[key];
              if (student && student["ROLL NO"] === userData.collegeId) {
                // Get student name
                const name = student["Name of the student"] || student["Name"] || student["name"] || null;
                if (name) {
                  setStudentName(name);
                }

                // Get and validate section
                const section = student["Section"] || student["SECTION"] || student["section"] || null;
                setStudentSection(section);

                // Validate if student is eligible for attendance
                const isValidRollNumber = isValidSectionBRollNumber(userData.collegeId);

                // Primary validation is roll number range (22B81A0565-22B81A05C8)
                const eligible = isValidRollNumber;
                setIsEligibleForAttendance(eligible);

                console.log(`[Attendance Eligibility] Roll: ${userData.collegeId}, Section: ${section}, Valid Roll Range (22B81A0565-22B81A05C8): ${isValidRollNumber}, Eligible: ${eligible}`);

                break;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching from Firebase:", error);
      }
    };

    fetchStudentData();
  }, [userData?.collegeId]);

  // Sync server time and check for daily reset
  useEffect(() => {
    const syncTime = async () => {
      const time = await getServerTime();
      setServerTime(time);

      // Check if we need to reset attendance (after 12:00 PM)
      await resetDailyAttendance();
    };

    syncTime();
    // Check every minute for reset
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

  // Real-time attendance subscription + localStorage check
  useEffect(() => {
    if (!userData?.collegeId) return;

    // Only load attendance if student is eligible (Section B, valid roll range)
    if (!isEligibleForAttendance) {
      console.log(`[Attendance] Student ${userData.collegeId} is not eligible for attendance tracking`);
      return;
    }

    const today = formatDate(serverTime);
    const section = "B"; // CSE Section-B (matches Firebase dataset)
    const branch = "05";
    const year = "22";
    const studentId = userData.collegeId;

    console.log(`[Attendance] Checking for student: ${studentId}, Section: B, Date: ${today}`);

    // Function to check localStorage for attendance (fallback when Firebase fails)
    const checkLocalStorage = () => {
      let foundAny = false;
      const markedByMap: Record<string, AttendanceRole> = {};

      setTodaySchedule((prev) =>
        prev.map((item) => {
          // Try multiple key formats
          const keys = [
            `attendance_${studentId}_${today}_${item.slotId}`,
            `attendance/records/${year}/${branch}/${section}/${today}/${studentId}_${today}_${item.slotId}`,
          ];

          for (const key of keys) {
            const saved = localStorage.getItem(key);
            if (saved) {
              try {
                const record: AttendanceRecord = JSON.parse(saved);
                if (record.studentId === studentId && record.slotId === item.slotId) {
                  console.log(`[Attendance] Found in localStorage: ${item.slotId} = ${record.status}, markedBy: ${record.markedByRole}`);
                  foundAny = true;
                  markedByMap[item.slotId] = record.markedByRole;
                  return { ...item, status: record.status, markedBy: record.markedBy, markedByRole: record.markedByRole };
                }
              } catch (e) { /* ignore parse errors */ }
            }
          }

          // Also scan all localStorage for matching records
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('attendance') && key.includes(studentId)) {
              try {
                const saved = localStorage.getItem(key);
                if (saved) {
                  const record: AttendanceRecord = JSON.parse(saved);
                  if (record.studentId === studentId && record.slotId === item.slotId) {
                    console.log(`[Attendance] Found matching record: ${record.status}, markedBy: ${record.markedByRole}`);
                    foundAny = true;
                    markedByMap[item.slotId] = record.markedByRole;
                    return { ...item, status: record.status, markedBy: record.markedBy, markedByRole: record.markedByRole };
                  }
                }
              } catch (e) { /* ignore */ }
            }
          }
          return item;
        })
      );

      // Update the markedBy state
      if (Object.keys(markedByMap).length > 0) {
        setAttendanceMarkedBy(prev => ({ ...prev, ...markedByMap }));
      }

      return foundAny;
    };

    // Check localStorage immediately
    checkLocalStorage();

    // Set up interval to poll localStorage every 2 seconds
    const interval = setInterval(checkLocalStorage, 2000);

    // Also try Firebase subscription
    const unsubscribe = subscribeToStudentAttendance(
      studentId, today, year, branch, section,
      (records) => {
        if (records.length > 0) {
          console.log(`[Attendance] Firebase: ${records.length} records`);
          const markedByMap: Record<string, AttendanceRole> = {};

          setTodaySchedule((prev) =>
            prev.map((item) => {
              const record = records.find((r) => r.slotId === item.slotId);
              if (record) {
                markedByMap[item.slotId] = record.markedByRole;
                return { ...item, status: record.status, markedBy: record.markedBy, markedByRole: record.markedByRole };
              }
              return item;
            })
          );

          setAttendanceMarkedBy(prev => ({ ...prev, ...markedByMap }));
        }
      }
    );

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [userData?.collegeId, serverTime, isEligibleForAttendance]);

  // Subscribe to real-time performance metrics
  useEffect(() => {
    if (!userData?.collegeId || !isEligibleForAttendance) return;

    const today = formatDate(serverTime);
    const section = "B";
    const branch = "05";
    const year = "22";
    const studentId = userData.collegeId;

    const unsubscribe = subscribeToPerformanceMetrics(
      studentId,
      today,
      year,
      branch,
      section,
      (metrics) => {
        console.log("[Performance] Real-time metrics updated:", metrics);
        setRealTimeMetrics(metrics);
      }
    );

    return () => unsubscribe();
  }, [userData?.collegeId, serverTime, isEligibleForAttendance]);

  // Handle self-marking for demo mode
  const handleSelfMark = async (item: DailyScheduleItem) => {
    if (!userData?.collegeId || item.status !== "NOT_MARKED") return;

    setSelfMarkingSlot(item.slotId);

    try {
      const today = formatDate(serverTime);
      const result = await studentSelfMark(
        userData.collegeId,
        item.slotId,
        today,
        item.subjectCode,
        item.subjectName,
        "B", // section
        "05", // branch
        "22" // year
      );

      if (result) {
        toast.success(`Marked PRESENT for ${item.subjectName}`, {
          description: "Attendance saved to Firebase for demo",
        });

        // Update local state immediately
        setTodaySchedule((prev) =>
          prev.map((s) =>
            s.slotId === item.slotId
              ? { ...s, status: "PRESENT" as AttendanceStatus, markedByRole: "STUDENT" as AttendanceRole }
              : s
          )
        );
        setAttendanceMarkedBy((prev) => ({ ...prev, [item.slotId]: "STUDENT" }));
      } else {
        toast.error("Failed to mark attendance");
      }
    } catch (error) {
      console.error("Self-mark error:", error);
      toast.error("Error marking attendance");
    } finally {
      setSelfMarkingSlot(null);
    }
  };

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

      const today = formatDate(time);
      const studentId = userData?.collegeId || "";

      console.log(`[Refresh] Checking localStorage for student: ${studentId}`);

      // Actively check localStorage for attendance records
      setTodaySchedule((prev) =>
        prev.map((item) => {
          const key = `attendance_${studentId}_${today}_${item.slotId}`;
          const saved = localStorage.getItem(key);

          if (saved) {
            try {
              const record = JSON.parse(saved);
              console.log(`[Refresh] Found: ${item.slotId} = ${record.status}`);
              return { ...item, status: record.status };
            } catch (e) {
              console.error("Error parsing record:", e);
            }
          }

          // Also check with different key formats
          for (let i = 0; i < localStorage.length; i++) {
            const storageKey = localStorage.key(i);
            if (storageKey && storageKey.includes('attendance') && storageKey.includes(studentId) && storageKey.includes(item.slotId)) {
              try {
                const data = localStorage.getItem(storageKey);
                if (data) {
                  const record = JSON.parse(data);
                  console.log(`[Refresh] Found via scan: ${record.status}`);
                  return { ...item, status: record.status };
                }
              } catch (e) { /* ignore */ }
            }
          }

          return item;
        })
      );

      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error("Error refreshing attendance:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusBadge = (status: AttendanceStatus, markedByRole?: AttendanceRole) => {
    switch (status) {
      case "PRESENT":
        // Green for Faculty, Blue for Admin
        const bgColor = markedByRole === 'FACULTY' ? 'bg-green-500/20' : 'bg-blue-500/20';
        const textColor = markedByRole === 'FACULTY' ? 'text-green-400' : 'text-blue-400';
        const borderColor = markedByRole === 'FACULTY' ? 'border-green-500/30' : 'border-blue-500/30';
        const hoverBg = markedByRole === 'FACULTY' ? 'hover:bg-green-500/30' : 'hover:bg-blue-500/30';

        return (
          <Badge className={`${bgColor} ${textColor} ${borderColor} ${hoverBg}`}>
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentTopbar studentId={userData?.collegeId || ""} />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
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
              <div>
                <CardTitle className="text-xl">Today's Schedule & Attendance</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Real-time attendance updates • Last synced: {serverTime.toLocaleTimeString()}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaySchedule.map((item) => {
                  // Determine background color based on who marked attendance
                  const markedByRole = attendanceMarkedBy[item.slotId] || (item as any).markedByRole;

                  // DEBUG: Log to help identify color issue
                  if (item.status === "PRESENT") {
                    console.log(`[Color Debug] ${item.subjectName}: markedByRole = "${markedByRole}", status = ${item.status}`);
                  }

                  let bgClass = "bg-muted/30 hover:bg-muted/50";
                  let borderClass = "";

                  if (item.status === "PRESENT") {
                    if (markedByRole === "FACULTY") {
                      bgClass = "bg-green-500/20 hover:bg-green-500/25";
                      borderClass = "border-l-4 border-l-green-500";
                    } else if (markedByRole === "ADMIN" || markedByRole === "SUB_ADMIN") {
                      // More prominent blue background for admin-marked attendance
                      bgClass = "bg-blue-500/20 hover:bg-blue-500/25";
                      borderClass = "border-l-4 border-l-blue-500";
                    } else if (markedByRole === "STUDENT") {
                      // Purple for student self-marked (demo mode)
                      bgClass = "bg-purple-500/20 hover:bg-purple-500/25";
                      borderClass = "border-l-4 border-l-purple-500";
                    } else {
                      // Default for present - treat as admin-marked (blue)
                      bgClass = "bg-blue-500/20 hover:bg-blue-500/25";
                      borderClass = "border-l-4 border-l-blue-500";
                    }
                  } else if (item.status === "ABSENT") {
                    bgClass = "bg-red-500/20 hover:bg-red-500/25";
                    borderClass = "border-l-4 border-l-red-500";
                  } else if (item.status === "LATE") {
                    bgClass = "bg-yellow-500/20 hover:bg-yellow-500/25";
                    borderClass = "border-l-4 border-l-yellow-500";
                  }

                  return (
                    <div
                      key={item.slotId}
                      onClick={() => item.status === "NOT_MARKED" && handleSelfMark(item)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg transition-all duration-300",
                        bgClass,
                        borderClass,
                        item.status === "NOT_MARKED" && "cursor-pointer hover:ring-2 hover:ring-primary/50",
                        selfMarkingSlot === item.slotId && "opacity-50 pointer-events-none"
                      )}
                      title={item.status === "NOT_MARKED" ? "Click to mark PRESENT (Demo Mode)" : undefined}
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
                      <div className="flex items-center gap-2">
                        {selfMarkingSlot === item.slotId && (
                          <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                        )}
                        {getStatusBadge(item.status, markedByRole)}
                      </div>
                    </div>
                  );
                })}
              </div>

            </CardContent>
          </Card>

          {/* Today's Attendance Summary - Real-time Metrics */}
          <Card className="border-border/50 shadow-lg bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Today's Attendance Summary
                <Badge variant="outline" className="ml-auto text-xs">
                  Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-2xl font-bold text-green-500">{realTimeMetrics.attended}</div>
                  <div className="text-xs text-muted-foreground">Present</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="text-2xl font-bold text-red-500">{realTimeMetrics.absent}</div>
                  <div className="text-xs text-muted-foreground">Absent</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-gray-500/10 border border-gray-500/20">
                  <div className="text-2xl font-bold text-gray-500">{realTimeMetrics.notMarked}</div>
                  <div className="text-xs text-muted-foreground">Not Marked</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className={cn(
                    "text-2xl font-bold",
                    realTimeMetrics.percentage >= 75 ? "text-green-500" :
                      realTimeMetrics.percentage >= 50 ? "text-yellow-500" : "text-red-500"
                  )}>
                    {realTimeMetrics.percentage}%
                  </div>
                  <div className="text-xs text-muted-foreground">Attendance</div>
                </div>
              </div>
              {realTimeMetrics.notMarked > 0 && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  💡 Tip: Click on "Not Marked" slots above to mark yourself present for demo
                </p>
              )}
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
