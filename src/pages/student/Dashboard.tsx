import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import StudentLayout from "@/components/StudentLayout";
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
  Megaphone,
} from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";

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
  subscribeToPerformanceMetrics,
  autoMarkAllAsPresent,
  shouldAutoMarkAsPresent,
  getHistoricalSubjectAttendance,
  getCalendarAttendanceData,
  CalendarDayStatus,
} from "@/services/attendanceService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EventShowcase from "@/components/EventShowcase";
import "@/styles/EventShowcase.css";

const StudentDashboard = () => {
  const { userData } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [studentName, setStudentName] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
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

  // Store fetched weekly schedule config to avoid repeated fetches
  const [weeklyScheduleConfig, setWeeklyScheduleConfig] = useState<any[] | null>(null);

  // Real-time performance metrics
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    totalClasses: 4,
    attended: 0,
    absent: 0,
    notMarked: 4,
    percentage: 0,
  });

  // Calendar attendance data for coloring
  const [calendarAttendance, setCalendarAttendance] = useState<Record<string, CalendarDayStatus>>({});

  // Announcements
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Academic Calendar
  const [academicEvents, setAcademicEvents] = useState<any[]>([]);
  const [studentSemester, setStudentSemester] = useState<string | null>(null);

  // Dynamic Dashboard Stats
  const [displaySemester, setDisplaySemester] = useState<string | null>(null);
  const [subjectsCount, setSubjectsCount] = useState<number | null>(null);
  const [labsCount, setLabsCount] = useState<number | null>(null);
  const [facultyCount, setFacultyCount] = useState<number | null>(null);

  // Normalize semester utility
  const normalizeSemester = (val: string | undefined): string => {
    if (!val) return "1"; // Default safely
    const str = val.toUpperCase().trim();
    
    // Check for digits directly first (handles "6", "Semester 6", "Semester-6", "1")
    const match = str.match(/(\d+)/);
    if (match) return match[1];

    // Roman Numerals map (longest first to avoid partial matches like I in VI)
    const romanMap: Record<string, string> = { "VIII": "8", "VII": "7", "VI": "6", "V": "5", "IV": "4", "III": "3", "II": "2", "I": "1" };
    
    // Clean up typical boilerplate
    const cleaned = str.replace(/SEMESTER|SEM|-|\s/g, "");
    
    // Check exact match in roman map
    if (romanMap[cleaned]) return romanMap[cleaned];
    
    // Fallback substring search if needed
    for (const [r, n] of Object.entries(romanMap)) {
      if (str.includes(r)) return n;
    }
    return "1";
  };

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

  // Fetch student name and validate section via Backend API
  // The backend uses Firebase Admin SDK so it doesn't need client-side Firebase auth
  useEffect(() => {
    if (!userData?.collegeId) return;

    const fetchStudentData = async () => {
      const rollNumber = userData.collegeId;
      console.log(`[StudentData] Fetching data for roll number: ${rollNumber}`);

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

      try {
        // Fetch student data from backend API (uses Firebase Admin SDK internally)
        const response = await fetch(`${apiBaseUrl}/students/${rollNumber}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`[StudentData] Got student data from backend:`, data);

          if (data.name) {
            setStudentName(data.name);
          }

          if (data.section) {
            setStudentSection(data.section);
          }

          const isValidRollNumber = isValidSectionBRollNumber(rollNumber);
          setIsEligibleForAttendance(isValidRollNumber);
        }

        // If backend returned 404, student not found in Firebase or MongoDB
        if (response.status === 404) {
          console.log(`[StudentData] Student ${rollNumber} not found in backend`);
        } else if (!response.ok) {
          console.warn(`[StudentData] Backend returned ${response.status}`);
        }
      } catch (error) {
        console.warn("[StudentData] Backend API call failed:", error);
      }

      // Fallback: set eligibility based on roll number even if name not found
      console.log(`[StudentData] Using fallback for ${rollNumber}`);
      const isValidRollNumber = isValidSectionBRollNumber(rollNumber);
      setIsEligibleForAttendance(isValidRollNumber);
    };

    fetchStudentData();
  }, [userData?.collegeId]);

  // Fetch semester from user profile (same source as Profile page)
  useEffect(() => {
    if (!userData?.uid) return;

    const fetchProfileSemester = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const response = await fetch(`${apiBaseUrl}/users/${userData.uid}`);
        if (response.ok) {
          const profile = await response.json();
          console.log(`[StudentData] Profile data from /users/:uid:`, profile);

          // Get semester as stored in profile (handle academicInformation.currentSemester as requested)
          const semesterValue = profile.academicInformation?.currentSemester || profile.semester || null;
          console.log(`[StudentData] Profile semester: "${semesterValue}"`);

          if (semesterValue) {
            setDisplaySemester(semesterValue);

            // Also normalize for academic calendar filtering
            const normalized = normalizeSemester(semesterValue);
            setStudentSemester(normalized);
          }
        }
      } catch (error) {
        console.warn("[StudentData] Failed to fetch profile semester:", error);
      }
    };

    fetchProfileSemester();
  }, [userData?.uid]);

  // Sync server time and check for daily reset
  useEffect(() => {
    const syncTime = async () => {
      const time = await getServerTime();
      setServerTime(time);

      // Check if we need to reset attendance (at date change)
      await resetDailyAttendance();
    };

    syncTime();
    // Check every minute for reset
    const interval = setInterval(syncTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // 1) Fetch whole weekly schedule once when studentSection is ready
  useEffect(() => {
    if (!studentSection) return;

    const fetchWeeklySchedule = async () => {
      let config = null;

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const params = new URLSearchParams({
          scheduleType: "student",
          degree: "Major",   // Using default generic values matching Faculty 
          year: "25",        // IV Year matching default
          semester: "I",     // Semester I
          section: "B",
        });

        const res = await fetch(`${apiBaseUrl}/schedules?${params.toString()}`);
        if (res.ok) {
          const schedules = await res.json();
          if (schedules.length > 0) {
            config = schedules[0].schedule;
            console.log("[Schedule] ✓ Loaded weekly schedule from MongoDB API");
          }
        }
      } catch (error) {
        console.log("[Schedule] MongoDB API call failed, trying localStorage fallback:", error);
      }

      if (!config) {
        try {
          const scheduleConfigStr = localStorage.getItem("campverse_schedule_config");
          if (scheduleConfigStr) {
            const parsedConfig = JSON.parse(scheduleConfigStr);
            const possibleKeys = [
              studentSection ? `22_05_${studentSection}` : null,
              "22_05_B",
              Object.keys(parsedConfig)[0]
            ].filter(Boolean);

            for (const key of possibleKeys) {
              if (key && parsedConfig[key]) {
                config = parsedConfig[key];
                break;
              }
            }
          }
        } catch (error) {
           console.log("[Schedule] Error loading schedule config from localStorage:", error);
        }
      }

      setWeeklyScheduleConfig(config || []);
    };

    fetchWeeklySchedule();
  }, [studentSection]);

  // 2) Update displayed schedule when calendar date changes
  useEffect(() => {
    // If we haven't fetched the config yet or don't have a section
    if (!weeklyScheduleConfig) {
      if (!studentSection) {
        setTodaySchedule([]);
        setIsLoadingSchedule(false);
      }
      return;
    }

    setIsLoadingSchedule(true);

    const targetDate = date || serverTime;
    const currentTime = formatTime(serverTime);
    
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let dayOfWeek = days[targetDate.getDay()];
    
    let scheduleData: any[] | null = null;
    const daySchedule = weeklyScheduleConfig.find((d: any) => d.day === dayOfWeek);

    if (daySchedule?.slots?.length > 0) {
      const filledSlots = daySchedule.slots.filter((slot: any) =>
        (slot.subjectCode && slot.subjectCode.trim() !== "") ||
        (slot.subjectName && slot.subjectName.trim() !== "")
      );

      if (filledSlots.length > 0) {
        scheduleData = filledSlots.map((slot: any, idx: number) => ({
          slotNumber: slot.slotNumber || idx + 1,
          subjectCode: slot.subjectCode || "",
          subjectName: slot.subjectName || "No Subject",
          startTime: slot.startTime || "09:00",
          endTime: slot.endTime || "10:00",
          room: slot.room || "",
          classType: slot.classType || "Class",
        }));
      }
    }

    const formatTimeDisplay = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    const initialSchedule: DailyScheduleItem[] = scheduleData ? scheduleData.map((slot) => ({
      slotId: `slot_${slot.slotNumber}`,
      slotNumber: slot.slotNumber,
      time: `${formatTimeDisplay(slot.startTime)} - ${formatTimeDisplay(slot.endTime)}`,
      subjectCode: slot.subjectCode,
      subjectName: slot.subjectName,
      room: slot.room || "",
      classType: slot.classType || "Class",
      status: "NOT_MARKED" as const,
      isSlotOpen: isSlotOpen(currentTime, slot.endTime.replace(':', ':'), 15),
      canMark: false,
    })) : [];

    setTodaySchedule(initialSchedule);

    // Apply fade transition logic smoothly
    setTimeout(() => {
      setIsLoadingSchedule(false);
    }, 250);

  }, [weeklyScheduleConfig, date, serverTime, studentSection]);

  // Real-time attendance subscription + localStorage check
  useEffect(() => {
    if (!userData?.collegeId) return;

    // Only load attendance if student is eligible (Section B, valid roll range)
    if (!isEligibleForAttendance) {
      console.log(`[Attendance] Student ${userData.collegeId} is not eligible for attendance tracking`);
      return;
    }

    const targetDate = date || serverTime;
    const today = formatDate(targetDate);
    const section = "B";
    const branch = "05";
    const year = "25"; // Update to match faculty generic filter (IV Year)
    const degree = "Major";
    const semester = "I";
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
  }, [userData?.collegeId, serverTime, isEligibleForAttendance, date]);

  // Subscribe to real-time performance metrics
  useEffect(() => {
    if (!userData?.collegeId || !isEligibleForAttendance) return;

    const targetDate = date || serverTime;
    const today = formatDate(targetDate);
    const section = "B";
    const branch = "05";
    const year = "25";
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
  }, [userData?.collegeId, serverTime, isEligibleForAttendance, date]);

  // Automatic attendance marking after 4:00 PM (16:00)
  // If faculty/admin hasn't marked attendance, auto-mark ALL students as PRESENT
  useEffect(() => {
    if (!isEligibleForAttendance) return;

    const checkAndAutoMark = async () => {
      const targetDate = date || serverTime;
      const isViewingToday = targetDate.toLocaleDateString() === serverTime.toLocaleDateString();

      // Check if it's 4:00 PM (16:00) or later and we are viewing today
      if (shouldAutoMarkAsPresent(serverTime) && isViewingToday) {
        const notMarkedSlots = todaySchedule.filter(s => s.status === "NOT_MARKED");

        if (notMarkedSlots.length > 0) {
          const today = formatDate(serverTime);
          console.log(`[AutoMark] Time is ${serverTime.getHours()}:${serverTime.getMinutes()}, auto-marking ${notMarkedSlots.length} slots for ALL students`);

          // Auto-mark ALL students in Section B as PRESENT
          const slotsToMark = notMarkedSlots.map(s => ({
            slotId: s.slotId,
            subjectCode: s.subjectCode,
            subjectName: s.subjectName,
          }));

          try {
            const result = await autoMarkAllAsPresent(
              today,
              "22", // year
              "05", // branch (CSE)
              "B",  // section
              slotsToMark
            );

            if (result.success && result.markedCount > 0) {
              console.log(`[AutoMark] Successfully marked ${result.markedCount} records as PRESENT in database`);

              // Update local state for current student
              setTodaySchedule((prev) =>
                prev.map((s) =>
                  notMarkedSlots.some(nm => nm.slotId === s.slotId)
                    ? { ...s, status: "PRESENT" as AttendanceStatus, markedByRole: "SYSTEM" as AttendanceRole }
                    : s
                )
              );

              toast.success(`Auto-marked ${notMarkedSlots.length} subject(s) as PRESENT`, {
                description: "All students marked - saved to database (after 4:00 PM)",
              });
            }
          } catch (error) {
            console.error("[AutoMark] Error:", error);
          }
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkAndAutoMark, 60000);
    // Also check on mount
    checkAndAutoMark();

    return () => clearInterval(interval);
  }, [isEligibleForAttendance, todaySchedule, serverTime, date]);

  // Load performance metrics - fetches historical attendance across ALL dates
  useEffect(() => {
    if (!userData?.collegeId || !isEligibleForAttendance) return;

    // Require studentSection from backend to run performance metrics
    if (!studentSection) {
      setPerformanceMetrics([]);
      setIsLoadingMetrics(false);
      return;
    }

    const loadHistoricalMetrics = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const coursesRes = await fetch(`${apiBaseUrl}/courses`);
        let subjects: { subjectCode: string; subjectName: string }[] = [];
        
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          // Profile match logic for course mapping
          const stdDept = userData?.department || "CSE";
          const stdYear = userData?.year || "IV Year";
          const stdSem = userData?.semester || "Semester I";

          subjects = coursesData
            .filter((c: any) => 
               c.status === "Active" &&
               (c.department === stdDept || !c.department) &&
               (c.year === stdYear || !c.year) &&
               (c.semester === stdSem || !c.semester)
            )
            .map((c: any) => ({
              subjectCode: c.courseCode,
              subjectName: c.courseName,
            }));
        }

        if (subjects.length === 0) {
          // If profile didn't match any courses, fallback to an empty array so Performance Metrics is accurate
          subjects = [];
        }

        const metrics = await getHistoricalSubjectAttendance(
          userData.collegeId,
          "22", // year
          "05", // branch (CSE)
          "B",  // section
          subjects
        );

        const validMetrics = (metrics || []).filter(m => m.totalClasses > 0);
        setPerformanceMetrics(validMetrics);

        // Calculate overall attendance
        const totalClasses = metrics.reduce((sum, m) => sum + m.totalClasses, 0);
        const totalAttended = metrics.reduce((sum, m) => sum + m.attended, 0);
        const overallPercentage = totalClasses > 0
          ? Math.round((totalAttended / totalClasses) * 100)
          : 0;

        setOverallAttendance({
          totalClasses,
          attended: totalAttended,
          percentage: overallPercentage,
        });

        console.log('[PerformanceMetrics] Loaded historical:', { totalClasses, totalAttended, overallPercentage });
      } catch (error) {
        console.error('[PerformanceMetrics] Error loading historical data:', error);
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    loadHistoricalMetrics();
  }, [userData?.collegeId, isEligibleForAttendance, todaySchedule]);

  // Load calendar attendance data for coloring
  useEffect(() => {
    if (!userData?.collegeId || !isEligibleForAttendance) return;

    const loadCalendarData = async () => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const data = await getCalendarAttendanceData(
          userData.collegeId,
          "22", // year
          "05", // branch
          "B",  // section
          startOfMonth,
          endOfMonth
        );

        setCalendarAttendance(data);
        console.log('[Calendar] Loaded attendance data:', data);
      } catch (error) {
        console.error('[Calendar] Error loading attendance data:', error);
      }
    };

    loadCalendarData();
  }, [userData?.collegeId, isEligibleForAttendance]);

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiBaseUrl}/announcements/active?audience=Students`);
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data);
        }
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      }
    };
    fetchAnnouncements();
  }, []);

  // Fetch Academic Calendar (Wait for studentSemester)
  useEffect(() => {
    if (!userData?.collegeId || !studentSemester) return;
    const fetchAcademicCalendar = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        console.log(`[AcademicCalendar] Fetching with semester filter: ${studentSemester}`);
        
        // Fetch specifically from ADMIN created events filtered by normalized semester
        const res = await fetch(`${apiBaseUrl}/academic-calendar?collegeId=ADMIN&semester=${studentSemester}`);
        if (res.ok) {
          const events = await res.json();
          // The API might return all events for the collegeId, so we double filter by semester value (normalized)
          const filtered = events.filter((e: any) => e.semester === studentSemester);
          console.log(`[AcademicCalendar] Fetched ${filtered.length} matching events for semester ${studentSemester}`);
          
          const sorted = filtered.sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
          setAcademicEvents(sorted);
        }
      } catch (error) {
        console.error("Failed to fetch academic calendar:", error);
      }
    };
    fetchAcademicCalendar();
  }, [userData?.collegeId, studentSemester]);

  if (!userData) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-screen">
          <Skeleton className="w-12 h-12 rounded-full mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </StudentLayout>
    );
  }

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
        // Color coding: Green=Faculty, Blue=Admin, Purple=Student (Demo)
        let bgColor = 'bg-blue-500/20';
        let textColor = 'text-blue-400';
        let borderColor = 'border-blue-500/30';
        let hoverBg = 'hover:bg-blue-500/30';
        let label = 'Present';

        if (markedByRole === 'FACULTY') {
          bgColor = 'bg-green-500/20';
          textColor = 'text-green-400';
          borderColor = 'border-green-500/30';
          hoverBg = 'hover:bg-green-500/30';
        } else if (markedByRole === 'STUDENT') {
          // Green for student self-marked (Demo Mode) - same as faculty
          bgColor = 'bg-green-500/20';
          textColor = 'text-green-400';
          borderColor = 'border-green-500/30';
          hoverBg = 'hover:bg-green-500/30';
          label = 'Present';
        } else if (markedByRole === 'ADMIN' || markedByRole === 'SUB_ADMIN') {
          bgColor = 'bg-blue-500/20';
          textColor = 'text-blue-400';
          borderColor = 'border-blue-500/30';
          hoverBg = 'hover:bg-blue-500/30';
        }

        return (
          <Badge className={`${bgColor} ${textColor} ${borderColor} ${hoverBg}`}>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {label}
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

  // Derive subjects and labs from weekly schedule config
  useEffect(() => {
    if (!weeklyScheduleConfig || weeklyScheduleConfig.length === 0) {
      setSubjectsCount(null);
      setLabsCount(null);
      return;
    }

    const allSlots: any[] = [];
    weeklyScheduleConfig.forEach((dayConfig: any) => {
      if (dayConfig?.slots) {
        dayConfig.slots.forEach((slot: any) => {
          if (slot.subjectCode && slot.subjectCode.trim() !== "") {
            allSlots.push(slot);
          }
        });
      }
    });

    // Group unique subjects by classType
    const subjectSet = new Set<string>();
    const labSet = new Set<string>();

    allSlots.forEach((slot) => {
      const code = slot.subjectCode.trim().toUpperCase();
      const type = (slot.classType || "Class").toLowerCase();
      if (type === "lab") {
        labSet.add(code);
      } else {
        subjectSet.add(code);
      }
    });

    console.log(`[DashboardStats] Unique subjects: ${subjectSet.size}, Unique labs: ${labSet.size}`);
    setSubjectsCount(subjectSet.size);
    setLabsCount(labSet.size);

    // Faculty count fallback: subjects + labs
    if (facultyCount === null) {
      setFacultyCount(subjectSet.size + labSet.size);
    }
  }, [weeklyScheduleConfig]);

  // Fetch faculty count from backend
  useEffect(() => {
    const fetchFacultyCount = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiBaseUrl}/faculty-assignments`);
        if (res.ok) {
          const assignments = await res.json();
          // Count unique facultyId values
          const uniqueFaculty = new Set(assignments.map((a: any) => a.facultyId));
          console.log(`[DashboardStats] Unique faculty from API: ${uniqueFaculty.size}`);
          if (uniqueFaculty.size > 0) {
            setFacultyCount(uniqueFaculty.size);
          }
        }
      } catch (error) {
        console.warn("[DashboardStats] Failed to fetch faculty count:", error);
      }
    };
    fetchFacultyCount();
  }, []);

  const stats = [
    {
      label: "Current Semester",
      value: displaySemester || "--",
      icon: <BarChart3 className="w-4 h-4" />,
      color: "text-orange-500",
    },
    {
      label: "Subjects",
      value: subjectsCount !== null ? String(subjectsCount) : "--",
      icon: <Users className="w-4 h-4" />,
      color: "text-green-500",
    },
    {
      label: "Labs",
      value: labsCount !== null ? String(labsCount) : "--",
      icon: <CalendarIcon className="w-4 h-4" />,
      color: "text-blue-500",
    },
    {
      label: "Faculty",
      value: facultyCount !== null ? String(facultyCount) : "--",
      icon: <Users className="w-4 h-4" />,
      color: "text-purple-500",
    },
  ];

  const formatDateLabel = (start: string, end: string) => {
    const sDate = new Date(start);
    const eDate = new Date(end);
    if (sDate.toDateString() === eDate.toDateString()) {
      return format(sDate, "dd.MM.yyyy");
    }
    return `${format(sDate, "dd.MM.yyyy")} to ${format(eDate, "dd.MM.yyyy")}`;
  };

  // Check if current date falls on an Exam or Holiday block
  const isDateBlockedByAcademicCalendar = (checkDate: Date) => {
    return academicEvents.some((evt) => {
      if (evt.type === "Academic") return false;
      const s = new Date(evt.startDate).setHours(0,0,0,0);
      const e = new Date(evt.endDate).setHours(23,59,59,999);
      const c = checkDate.getTime();
      return c >= s && c <= e;
    });
  };

  return (
    <StudentLayout>
      {/* Welcome Section */}
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-foreground flex flex-wrap items-center gap-2">
          Hello <span className="text-primary truncate max-w-[200px] md:max-w-none">{studentName || userData?.collegeId}</span> <span className="text-xl">👋</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Let's learn something new today!
        </p>
      </div>

      {/* Netflix-style Event & Club Showcase */}
      <EventShowcase />

      {/* Today's Schedule & Attendance */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <div>
            <CardTitle className="text-xl">
              {date && date.toLocaleDateString() !== serverTime.toLocaleDateString()
                ? "Schedule & Attendance for the Day"
                : "Schedule & Attendance for Today"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn("space-y-3 transition-all duration-300 ease-in-out", isLoadingSchedule ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0")}>
            {isLoadingSchedule ? (
              // Loading animation
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4 rounded-md bg-muted/50" />
                      <Skeleton className="h-4 w-1/4 rounded-md bg-muted/50" />
                    </div>
                    <div className="text-center mx-4">
                      <Skeleton className="h-4 w-24 rounded-md bg-muted/50" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-20 rounded-full bg-muted/50" />
                    </div>
                  </div>
                ))}
              </>
            ) : isDateBlockedByAcademicCalendar(date || serverTime) ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mb-4 text-orange-500/50" />
                <h3 className="text-lg font-medium text-foreground">No Classes Scheduled - Academic Calendar Event</h3>
                <p>An academic event or holiday is active on this day.</p>
              </div>
            ) : todaySchedule.length === 0 ? (
              // Empty Schedule State
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <>
                    <CalendarIcon className="w-12 h-12 mb-4 text-muted-foreground/30" />
                    <h3 className="text-lg font-medium text-foreground">No Schedule Found</h3>
                    <p>No classes scheduled for this day.</p>
                  </>
              </div>
            ) : [...todaySchedule]
              .sort((a, b) => {
                const parseTime = (timeStr?: string) => {
                  if (!timeStr) return 0;
                  const startPart = timeStr.split(/[-–]/)[0].trim();
                  const match = startPart.match(/(\d+):(\d+)\s*(AM|PM)/i);
                  if (match) {
                    let hours = parseInt(match[1]);
                    const minutes = parseInt(match[2]);
                    const period = match[3].toUpperCase();
                    if (period === 'PM' && hours !== 12) hours += 12;
                    if (period === 'AM' && hours === 12) hours = 0;
                    return hours * 60 + minutes;
                  }
                  return 0;
                };
                return parseTime(a.time) - parseTime(b.time);
              })
              .map((item) => {
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
                  // Green for student self-marked (demo mode) - same as faculty
                  bgClass = "bg-green-500/20 hover:bg-green-500/25";
                  borderClass = "border-l-4 border-l-green-500";
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
                  className={cn(
                    "flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg transition-all duration-300 gap-4",
                    bgClass,
                    borderClass
                  )}
                >
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-foreground">
                      {item.subjectName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.subjectCode}
                    </div>
                    {(item.room || item.classType) && (
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {item.room && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                            {item.room}
                          </span>
                        )}
                        {item.classType && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-medium">
                            {item.classType}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6">
                    {item.time && (
                      <div className="text-sm sm:text-base font-medium text-foreground tracking-wide whitespace-nowrap">
                        {item.time}
                      </div>
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
            Selected Date Attendance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Calculate totals from historical + today's data */}
          {(() => {
            // Get cumulative totals from performance metrics directly
            const totalClasses = performanceMetrics.reduce((sum, m) => sum + m.totalClasses, 0);
            const totalPresent = performanceMetrics.reduce((sum, m) => sum + m.attended, 0);
            const totalAbsent = performanceMetrics.reduce((sum, m) => sum + m.absent, 0);
            const totalNotMarked = performanceMetrics.reduce((sum, m) => sum + m.notMarked, 0);
            
            const percentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <div className="text-center p-2 sm:p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-xl sm:text-2xl font-bold text-blue-500">{totalClasses}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Total Classes</div>
                </div>
                <div className="text-center p-2 sm:p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-xl sm:text-2xl font-bold text-green-500">{totalPresent}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Present</div>
                </div>
                <div className="text-center p-2 sm:p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="text-xl sm:text-2xl font-bold text-red-500">{totalAbsent}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Absent</div>
                </div>
                <div className="text-center p-2 sm:p-3 rounded-lg bg-gray-500/10 border border-gray-500/20">
                  <div className="text-xl sm:text-2xl font-bold text-gray-500">{totalNotMarked}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Not Marked</div>
                </div>
                <div className="text-center p-2 sm:p-3 rounded-lg bg-primary/10 border border-primary/20 col-span-2 sm:col-span-1">
                  <div className={cn(
                    "text-xl sm:text-2xl font-bold",
                    percentage >= 76 ? "text-green-500" :
                      percentage >= 65 ? "text-orange-500" : "text-red-500"
                  )}>
                    {percentage}%
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Attendance</div>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className={`text-xl sm:text-2xl font-bold ${stat.color} mb-1 sm:mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">
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
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingMetrics ? (
                // Performance Metrics Loading Animation
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between mb-2">
                        <Skeleton className="h-4 w-1/2 rounded-md bg-muted/50" />
                        <Skeleton className="h-4 w-12 rounded-md bg-muted/50" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full bg-muted/50" />
                      <div className="flex justify-between mt-1">
                        <Skeleton className="h-3 w-1/4 rounded-md bg-muted/50" />
                        <Skeleton className="h-3 w-20 rounded-md bg-muted/50" />
                      </div>
                    </div>
                  ))}
                </>
              ) : performanceMetrics.length === 0 ? (
                // Empty Performance Metrics State
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mb-4 text-muted-foreground/30" />
                  <h3 className="text-lg font-medium text-foreground">No Performance Metrics</h3>
                  <p>Performance data is not available yet.</p>
                </div>
              ) : performanceMetrics.map((metric, index) => (
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

          {/* Announcements Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              Announcements
            </h3>
            {announcements.length === 0 ? (
              <Card className="border-border/50 border-dashed bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Megaphone className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No active announcements</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <Card key={ann._id} className="border-border/50 shadow-md hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-base leading-tight">{ann.title}</CardTitle>
                        {ann.priority === "Important" && (
                          <Badge variant="destructive" className="shrink-0 text-[10px] px-1.5 py-0 h-4">Important</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{ann.message}</p>
                      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                        <span className="font-medium">Posted by {ann.createdBy}</span>
                        <span>•</span>
                        <span>{new Date(ann.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Calendar & Events */}
        <div className="space-y-6">
          <Card className="border-border/50 shadow-lg">
            <CardContent className="p-4 flex justify-center">
              {(() => {
                const presentDates = Object.entries(calendarAttendance)
                  .filter(([_, status]) => status === 'present')
                  .map(([dateStr]) => new Date(dateStr));
                  

                const absentDates = Object.entries(calendarAttendance)
                  .filter(([_, status]) => status === 'absent')
                  .map(([dateStr]) => new Date(dateStr));

                return (
                  <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md"
                      modifiers={{ 
                        sunday: (day) => day.getDay() === 0,
                        present: presentDates,
                        absent: absentDates
                      }}
                      modifiersStyles={{ 
                        sunday: { color: 'rgb(156, 163, 175)' } 
                      }}
                      modifiersClassNames={{
                        present: "bg-[#22c55e] hover:bg-[#22c55e]/90 text-white font-medium !rounded-full",
                        absent: "bg-[#ef4444] hover:bg-[#ef4444]/90 text-white font-medium !rounded-full",
                      }}
                      disabled={(day) => day.getDay() === 0}
                    />

                    <div className="flex flex-col gap-4 py-4 sm:border-l border-border/20 sm:pl-8">
                      <h4 className="font-semibold text-base leading-tight">
                        Attendence
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-4 h-4 rounded-full bg-[#22c55e]"></div>
                          <span className="text-sm font-medium">Present</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-4 h-4 rounded-full bg-[#ef4444]"></div>
                          <span className="text-sm font-medium">Absent</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Academic Calendar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {academicEvents.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No Academic Events Available
                </div>
              ) : (
                academicEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${event.color}`}
                    ></div>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-sm font-medium text-foreground truncate">
                        {event.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateLabel(event.startDate, event.endDate)}
                      </div>
                    </div>
                    {event.tagLabel && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {event.tagLabel}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
