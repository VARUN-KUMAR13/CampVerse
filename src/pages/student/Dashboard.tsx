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
  CalendarDays,
  ClipboardCheck,
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
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Record<string, boolean>>({});

  const toggleAnnouncement = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedAnnouncements(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Academic Calendar
  const [academicEvents, setAcademicEvents] = useState<any[]>([]);
  const [studentSemester, setStudentSemester] = useState<string | null>(null);

  // Toggle for presentation/demo purposes
  const [demoMode, setDemoMode] = useState(true);

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

  const getMappedYear = (collegeId: string) => {
    if (!collegeId) return "25";
    const yearCode = collegeId.substring(0, 2);
    if (!yearCode || !/^\d{2}$/.test(yearCode)) return "25";
    const admissionYear = parseInt("20" + yearCode);
    const now = new Date();
    const curYear = now.getFullYear();
    const academicStartYear = now.getMonth() >= 6 ? curYear : curYear - 1;
    const diff = Math.min(Math.max(academicStartYear - admissionYear, 0), 3);
    const map = ["22", "23", "24", "25"];
    return map[diff] || "25";
  };

  const getMappedBranch = (collegeId: string) => {
    if (!collegeId) return "05";
    const branchCode = collegeId.substring(6, 8);
    if (branchCode === "04") return "04";
    if (branchCode === "12") return "06";
    return "05";
  };

  const getMappedSemester = (roman: string) => {
    if (!roman) return "I";
    const r = String(roman).trim().toUpperCase().replace(/SEMESTER\s*-?\s*/g, '');
    const dict: Record<string, string> = {
      "I": "I", "II": "II", 
      "III": "I", "IV": "II",
      "V": "I", "VI": "II",
      "VII": "I", "VIII": "II",
      "1": "I", "2": "II"
    };
    return dict[r] || "I";
  };

  const getMappedSection = (rollNo: string): string => {
    if (!rollNo) return "A";
    const lastTwo = rollNo.slice(-2).toUpperCase();
    if (lastTwo.length !== 2) return "A";

    let value = 0;
    const firstChar = lastTwo[0];
    const secondChar = lastTwo[1];

    if (firstChar >= '0' && firstChar <= '9') {
      value = parseInt(lastTwo, 10);
    } else if (firstChar >= 'A' && firstChar <= 'Z') {
      const letterVal = firstChar.charCodeAt(0) - 65;
      value = 100 + (letterVal * 10);
      if (secondChar >= '0' && secondChar <= '9') {
        value += parseInt(secondChar, 10);
      } else {
        value += (secondChar.charCodeAt(0) - 65 + 10);
      }
    }

    const section = value <= 64 ? "A" : "B";
    console.log(`[Section Mapping] Roll: ${rollNo}, Parsed Value: ${value}, Section: ${section}`);
    return section;
  };

  // Normalize semester strings for comparison (handles "Semester-II", "Semester II", "Semester-I", etc.)
  const normSemStr = (s: string) => s.replace(/[-\s]+/g, " ").trim().toLowerCase();

  const getCourseMapping = (romanStr: string) => {
    const cleanRoman = romanStr.replace(/SEMESTER\s*-?\s*/i, "").trim().toUpperCase();
    // semesters array: first is the relative semester (I or II), second is the absolute semester (e.g. VIII)
    const mapping: Record<string, { year: string; semesters: string[] }> = {
      "VIII": { year: "IV Year", semesters: ["Semester II", "Semester VIII"] },
      "VII":  { year: "IV Year", semesters: ["Semester I", "Semester VII"] },
      "VI":   { year: "III Year", semesters: ["Semester II", "Semester VI"] },
      "V":    { year: "III Year", semesters: ["Semester I", "Semester V"] },
      "IV":   { year: "II Year", semesters: ["Semester II", "Semester IV"] },
      "III":  { year: "II Year", semesters: ["Semester I", "Semester III"] },
      "II":   { year: "I Year", semesters: ["Semester II"] },
      "I":    { year: "I Year", semesters: ["Semester I"] },
    };
    return mapping[cleanRoman] || { year: "IV Year", semesters: ["Semester II", "Semester VIII"] };
  };

  // Check if a course's semester matches any of the mapped semesters
  const matchesSemester = (courseSem: string, targetSemesters: string[]) => {
    const normalized = normSemStr(courseSem || "");
    return targetSemesters.some(ts => normSemStr(ts) === normalized);
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

          // Dynamically derive section from roll number instead of using potentially incorrect DB section
          setStudentSection(getMappedSection(rollNumber));
          setIsEligibleForAttendance(true);
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
      setStudentSection(getMappedSection(rollNumber));
      setIsEligibleForAttendance(true);
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
          let semesterValue = profile.academicInformation?.currentSemester || profile.semester || null;
          
          if (userData?.collegeId?.startsWith("22")) {
            semesterValue = "VIII";
          } else if (semesterValue) {
            semesterValue = semesterValue.replace(/SEMESTER\s*-?\s*/i, "").trim().toUpperCase();
          }
          
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
      
      // Fallback in case of fetch failure
      if (userData?.collegeId?.startsWith("22")) {
        setDisplaySemester("VIII");
        setStudentSemester("8"); // "VIII" normalizes to "8"
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
    if (!studentSection || !displaySemester || !userData?.collegeId) return;

    const fetchWeeklySchedule = async () => {
      let config = null;

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const params = new URLSearchParams({
          scheduleType: "student",
          degree: "Major",
          year: getMappedYear(userData.collegeId),
          semester: getMappedSemester(displaySemester),
          branch: getMappedBranch(userData.collegeId),
          section: studentSection,
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
            const yearCode = getMappedYear(userData.collegeId);
            const branchCode = getMappedBranch(userData.collegeId);
            const possibleKeys = [
              studentSection ? `${yearCode}_${branchCode}_${studentSection}` : null,
              `${yearCode}_${branchCode}_B`,
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
  }, [studentSection, displaySemester, userData?.collegeId]);

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
    const dayOfWeek = days[targetDate.getDay()];
    
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
    const section = studentSection || "B";
    const branch = getMappedBranch(userData.collegeId);
    const year = getMappedYear(userData.collegeId);
    const degree = "Major";
    const semester = "I";
    const studentId = userData.collegeId;

    console.log(`[Attendance] Checking for student: ${studentId}, Section: ${section}, Branch: ${branch}, Year: ${year}, Date: ${today}`);

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
                // Skip SYSTEM auto-marked records — treat them as NOT_MARKED
                if (record.markedByRole === 'SYSTEM') continue;
                const slotNumMatch = item.slotId.replace('slot_', '');
                if (record.studentId === studentId && (record.slotId === item.slotId || record.slotId.startsWith(`slot_${slotNumMatch}_`))) {
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
                  // Skip SYSTEM auto-marked records
                  if (record.markedByRole === 'SYSTEM') continue;
                  const slotNumMatch = item.slotId.replace('slot_', '');
                  if (record.studentId === studentId && (record.slotId === item.slotId || record.slotId.startsWith(`slot_${slotNumMatch}_`))) {
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
        // Filter out SYSTEM auto-marked records so they appear as NOT_MARKED
        const validRecords = records.filter((r) => r.markedByRole !== 'SYSTEM');
        if (validRecords.length > 0) {
          console.log(`[Attendance] Firebase: ${validRecords.length} valid records (${records.length - validRecords.length} SYSTEM records ignored)`);
          const markedByMap: Record<string, AttendanceRole> = {};

          setTodaySchedule((prev) =>
            prev.map((item) => {
              // Match by exact slotId OR by slot number prefix (faculty uses slot_1_<mongoId> format)
              const slotNum = item.slotId.replace('slot_', '');
              const record = validRecords.find((r) => r.slotId === item.slotId || r.slotId.startsWith(`slot_${slotNum}_`));
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
    const section = studentSection || "B";
    const branch = getMappedBranch(userData.collegeId);
    const year = getMappedYear(userData.collegeId);
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

  // Auto-attendance after 4 PM has been disabled.
  // Unmarked attendance slots will remain as "Not Marked" until faculty/admin explicitly marks them.

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
        const params = new URLSearchParams();
        if (studentSection) params.append("section", studentSection);
        if (userData.collegeId) params.append("studentId", userData.collegeId);

        const coursesRes = await fetch(`${apiBaseUrl}/courses?${params.toString()}`);
        let subjects: { subjectCode: string; subjectName: string }[] = [];
        
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          const { year: targetYear, semesters: targetSems } = getCourseMapping(displaySemester || "");
          console.log(`[AttendanceMetrics] displaySemester="${displaySemester}" → targetYear="${targetYear}", targetSems=${JSON.stringify(targetSems)}`);
          console.log(`[AttendanceMetrics] Total courses from API: ${coursesData.length}`);
          coursesData.slice(0, 5).forEach((c: any) => console.log(`  → ${c.courseName} | year="${c.year}" semester="${c.semester}" status="${c.status}"`));
          
          subjects = coursesData
              .filter((c: any) => {
                 return c.year === targetYear && matchesSemester(c.semester, targetSems) && c.status === "Active";
             })
             .map((c: any) => ({
                subjectCode: c.courseCode,
                subjectName: c.courseName,
             }));
          console.log(`[AttendanceMetrics] Matched ${subjects.length} courses after filter`);
        }

        if (subjects.length === 0) {
          // If profile didn't match any courses, fallback to an empty array so Performance Metrics is accurate
          subjects = [];
        }

        const metrics = await getHistoricalSubjectAttendance(
          userData.collegeId,
          getMappedYear(userData.collegeId),
          getMappedBranch(userData.collegeId),
          studentSection || "B",
          subjects
        );

        const validMetrics = metrics || [];
        setPerformanceMetrics(validMetrics);

        // Calculate overall attendance
        const totalClasses = validMetrics.reduce((sum, m) => sum + m.totalClasses, 0);
        const totalAttended = validMetrics.reduce((sum, m) => sum + m.attended, 0);
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
          getMappedYear(userData.collegeId),
          getMappedBranch(userData.collegeId),
          studentSection || "B",
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

  const getStatusBadge = (status: AttendanceStatus, markedByRole?: AttendanceRole, markedBy?: string, classType?: string) => {
    switch (status) {
      case "PRESENT": {
        let bgColor = 'bg-blue-500/20';
        let textColor = 'text-blue-400';
        let borderColor = 'border-blue-500/30';
        let hoverBg = 'hover:bg-blue-500/30';
        const label = 'Present';

        const isAdminMarked = markedByRole === 'ADMIN' || markedByRole === 'SUB_ADMIN' || markedBy?.toLowerCase() === 'admin';

        if (isAdminMarked) {
          bgColor = 'bg-blue-500/20';
          textColor = 'text-blue-400';
          borderColor = 'border-blue-500/30';
          hoverBg = 'hover:bg-blue-500/30';
        } else if (markedByRole === 'FACULTY' || markedByRole === 'STUDENT') {
          // Green for faculty or student self-marked
          bgColor = 'bg-green-500/20';
          textColor = 'text-green-400';
          borderColor = 'border-green-500/30';
          hoverBg = 'hover:bg-green-500/30';
        }

        return (
          <Badge className={`${bgColor} ${textColor} ${borderColor} ${hoverBg}`}>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {label}
          </Badge>
        );
      }
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
        // Do not show "Not Marked" for Sports
        if (classType && classType.toLowerCase() === 'sports') {
          return null;
        }
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

  // Derive theory, labs, and faculty counts strictly from actual course data mapped to the current semester
  useEffect(() => {
    if (!userData || !displaySemester || !studentSemester) return;

    const fetchSemesterCourses = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const params = new URLSearchParams();
        if (userData.section) params.append("section", userData.section);
        if (userData.collegeId) params.append("studentId", userData.collegeId);
        
        const res = await fetch(`${apiBaseUrl}/courses?${params.toString()}`);
        if (res.ok) {
          const allCourses = await res.json();
          
          // Isolate courses belonging exactly to the student's current mapped semester designation
          const { year: targetYear, semesters: targetSems } = getCourseMapping(displaySemester || "");
          console.log(`[DashboardStats] displaySemester="${displaySemester}" → targetYear="${targetYear}", targetSems=${JSON.stringify(targetSems)}`);
          console.log(`[DashboardStats] Total courses from API: ${allCourses.length}`);
          
          const activeSemesterCourses = allCourses.filter((c: any) => {
             return c.year === targetYear && matchesSemester(c.semester, targetSems) && c.status === "Active";
          });
          console.log(`[DashboardStats] Matched ${activeSemesterCourses.length} courses`);

          // Compute explicit counts isolating strictly against exact classType field states natively
          const theoryCount = activeSemesterCourses.filter((c: any) => (!c.classType || c.classType === "Theory")).length;
          const labsCountResult = activeSemesterCourses.filter((c: any) => c.classType === "Lab").length;

          console.log(`[DashboardStats] Dynamically Computed from Core Courses -> Theory: ${theoryCount}, Labs: ${labsCountResult}, Faculty: ${theoryCount + labsCountResult}`);
          setSubjectsCount(theoryCount);
          setLabsCount(labsCountResult);
          
          // Total count exactly equals number of theory subjects + number of lab subjects
          setFacultyCount(theoryCount + labsCountResult);
        }
      } catch (error) {
        console.warn("[DashboardStats] Failed to fetch semester courses strictly:", error);
      }
    };
    
    fetchSemesterCourses();
  }, [userData, displaySemester, studentSemester]);

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

  const stats = [
    {
      label: "Current Semester",
      value: displaySemester || "--",
      icon: <BarChart3 className="w-4 h-4" />,
      color: "text-orange-500",
    },
    {
      label: "Theory",
      value: subjectsCount !== null ? String(subjectsCount) : "0",
      icon: <Users className="w-4 h-4" />,
      color: "text-green-500",
    },
    {
      label: "Labs",
      value: labsCount !== null ? String(labsCount) : "0",
      icon: <CalendarIcon className="w-4 h-4" />,
      color: "text-blue-500",
    },
    {
      label: "Faculty",
      value: facultyCount !== null ? String(facultyCount) : "0",
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
    if (demoMode) return false; // Bypass calendar restrictions for presentation/demo purposes

    return academicEvents.some((evt) => {
      if (evt.type === "Academic") return false;
      const s = new Date(evt.startDate).setHours(0,0,0,0);
      const e = new Date(evt.endDate).setHours(23,59,59,999);
      const c = checkDate.getTime();
      return c >= s && c <= e;
    });
  };

  const getScheduleTitle = () => {
    if (!date) return "Schedule & Attendance for Today";
    const dDate = new Date(date).setHours(0, 0, 0, 0);
    const dToday = new Date(serverTime).setHours(0, 0, 0, 0);
    const diffDays = Math.round((dDate - dToday) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Schedule & Attendance for Today";
    if (diffDays === 1) return "Schedule & Attendance for Tomorrow";
    if (diffDays === -1) return "Schedule & Attendance for Yesterday";
    return `Schedule & Attendance on ${format(date, "MMM dd, yyyy")}`;
  };

  return (
    <StudentLayout>
      {/* Welcome Section */}
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-foreground flex flex-wrap items-center gap-2">
          Hello, <span className="text-primary truncate max-w-[200px] md:max-w-none">{studentName || userData?.collegeId}</span> <span className="text-xl">👋</span>
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
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              {getScheduleTitle()}
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
                    <p>No schedule available for selected date</p>
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
                const isAdminMarked = markedByRole === "ADMIN" || markedByRole === "SUB_ADMIN" || item.markedBy?.toLowerCase() === "admin";

                if (isAdminMarked) {
                  // More prominent blue background for admin-marked attendance
                  bgClass = "bg-blue-500/20 hover:bg-blue-500/25";
                  borderClass = "border-l-4 border-l-blue-500";
                } else if (markedByRole === "FACULTY" || markedByRole === "STUDENT") {
                  // Green for faculty or student self-marked
                  bgClass = "bg-green-500/20 hover:bg-green-500/25";
                  borderClass = "border-l-4 border-l-green-500";
                } else {
                  // Default for present - treat as admin-marked (blue) just in case
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
                    {getStatusBadge(item.status, markedByRole, item.markedBy, item.classType)}
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
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Attendance Summary
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
                    percentage >= 75 ? "text-green-500" :
                      percentage >= 50 ? "text-yellow-500" : "text-red-500"
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

          {/* Attendance Metrics */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Attendance Metrics
                </CardTitle>
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
                  <p className="text-lg font-medium">No courses available for this semester</p>
                </div>
              ) : [...performanceMetrics].reverse().map((metric, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground">{metric.subjectName}</span>
                    <span className={cn(
                      "font-medium",
                      metric.percentage >= 75 ? "text-green-500" :
                        metric.percentage >= 50 ? "text-yellow-500" : "text-red-500"
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
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Megaphone className="w-5 h-5 text-primary" />
                Latest Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[720px] overflow-y-auto scroll-smooth px-4 sm:px-6">
                {announcements.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Megaphone className="w-10 h-10 text-muted-foreground/20 mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">No active announcements at the moment</p>
                  </div>
                ) : (
                  <div className="space-y-0 divide-y divide-border/30">
                    {announcements.map((ann) => {
                      const isExpanded = expandedAnnouncements[ann._id];
                      const hasImage = !!ann.image;
                      const hasLongText = ann.message && ann.message.length > 120;
                      const isCollapsible = hasImage || hasLongText;

                      return (
                        <div key={ann._id} className="py-5 first:pt-0 last:pb-0">
                          {/* Header: Avatar + Name + Date + Priority */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-md shrink-0">
                              {ann.createdBy?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground leading-none">{ann.createdBy || 'Admin'}</p>
                              <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                                {new Date(ann.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                                {" · "}
                                {new Date(ann.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                              </p>
                            </div>
                            {ann.priority === "Important" && (
                              <span className="px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 text-[10px] font-bold uppercase tracking-wider border border-red-500/20">
                                Urgent
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h4 className="font-bold text-[15px] sm:text-base text-foreground leading-snug mb-2">
                            {ann.title}
                          </h4>

                          {/* Message */}
                          <div className="relative">
                            <p className={cn(
                              "text-[13px] sm:text-sm text-muted-foreground/90 leading-relaxed whitespace-pre-wrap transition-all duration-500",
                              !isExpanded && isCollapsible && "line-clamp-2"
                            )}>
                              {ann.message}
                            </p>
                            {/* Gradient fade overlay when collapsed */}
                            {!isExpanded && isCollapsible && (
                              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                            )}
                          </div>

                          {/* Image */}
                          {hasImage && (
                            <div
                              className={cn(
                                "mt-3 rounded-lg overflow-hidden transition-all duration-500 ease-in-out cursor-pointer",
                                !isExpanded ? "max-h-[140px]" : "max-h-[700px]"
                              )}
                              onClick={() => window.open(ann.image, '_blank')}
                            >
                              <img
                                src={ann.image}
                                alt={ann.title}
                                className={cn(
                                  "w-full transition-all duration-500",
                                  isExpanded ? "object-contain rounded-lg" : "object-cover object-top"
                                )}
                                loading="lazy"
                              />
                            </div>
                          )}

                          {/* Expand / Collapse */}
                          {isCollapsible && (
                            <button
                              onClick={(e) => toggleAnnouncement(ann._id, e)}
                              className="mt-2 text-primary/80 hover:text-primary text-xs font-medium hover:underline transition-colors flex items-center gap-1"
                            >
                              {isExpanded ? '— Show less' : '+ Read more'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
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
                        Attendance Legend
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
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                <CalendarDays className="w-5 h-5 text-primary" />
                Academic Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative pb-6">
              {academicEvents.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No Academic Events Available
                </div>
              ) : (
                <div className="relative">
                  {/* Position line precisely using left + transform translate mapping to the dot's identical relative offset */}
                  <div 
                    className="absolute top-4 bottom-4 border-l-2 border-dotted border-muted-foreground/40 z-0"
                    style={{ left: '14px', transform: 'translateX(-50%)', width: 0 }}
                  ></div>

                  <div className="space-y-3 relative z-10 w-full">
                    {academicEvents.map((event, index) => {
                       const nowTime = new Date().getTime();
                       const sDateObj = new Date(event.startDate);
                       sDateObj.setHours(0, 0, 0, 0);
                       const eDateObj = new Date(event.endDate);
                       eDateObj.setHours(23, 59, 59, 999);
                       const isCurrent = sDateObj.getTime() <= nowTime && eDateObj.getTime() >= nowTime;

                       return (
                        <div
                          key={index}
                          className={cn(
                            "flex items-start space-x-3 p-2 rounded-lg transition-colors relative w-full",
                            isCurrent
                              ? "bg-muted/50 shadow-sm ring-1 ring-primary/40"
                              : "bg-muted/30 hover:bg-muted/50"
                          )}
                        >
                          {/* Common relative container for the dot that guarantees width & exact center alignment */}
                          <div className="relative w-3 shrink-0 h-4 mt-[3px]">
                            <div
                              className={cn(
                                "w-3 h-3 rounded-full absolute top-[2px]",
                                event.color,
                                isCurrent && "ring-2 ring-primary/50 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                              )}
                              style={{ left: '50%', transform: 'translateX(-50%)' }}
                            ></div>
                          </div>
                          
                          {/* Event Text Content */}
                          <div className="flex-1 overflow-visible">
                            <div className="text-sm font-medium text-foreground whitespace-normal break-words leading-tight">
                              {event.title}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatDateLabel(event.startDate, event.endDate)}
                            </div>
                          </div>
                          
                          {/* Event Tag */}
                          {event.tagLabel && (
                            <Badge variant={isCurrent ? "default" : "secondary"} className="text-[10px] shrink-0 self-start mt-0.5 whitespace-nowrap px-1.5 py-0">
                              {event.tagLabel}
                            </Badge>
                          )}
                        </div>
                       );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
