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
import { database, isDevelopment, firebaseReady, auth } from "@/lib/firebase";
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

  // Calendar attendance data for coloring
  const [calendarAttendance, setCalendarAttendance] = useState<Record<string, CalendarDayStatus>>({});

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
      const rollNumber = userData.collegeId;
      console.log(`[StudentData] Fetching data for roll number: ${rollNumber}`);

      // Development mode fallback - hardcoded student names
      const DEV_STUDENT_NAMES: Record<string, string> = {
        '22B81A05C3': 'KATAKAM VARUN KUMAR',
        '22B81A05C4': 'KATAKAM VARUN KUMAR',
        // Add more students as needed
      };

      // Check if we have a hardcoded name for this roll number (for development)
      if (DEV_STUDENT_NAMES[rollNumber]) {
        console.log(`[StudentData] Using dev fallback name: ${DEV_STUDENT_NAMES[rollNumber]}`);
        setStudentName(DEV_STUDENT_NAMES[rollNumber]);
        const isValidRollNumber = isValidSectionBRollNumber(rollNumber);
        setIsEligibleForAttendance(isValidRollNumber);
        setStudentSection('C'); // Default section for development
        return; // Exit early, skip Firebase calls in dev mode
      }

      try {
        // Strategy 1: Use Firebase SDK if available
        if (firebaseReady && database) {
          console.log("[StudentData] Using Firebase SDK...");

          // Try direct path: students/{rollNumber}
          try {
            const studentRef = ref(database, `students/${rollNumber}`);
            const snapshot = await get(studentRef);
            if (snapshot.exists()) {
              const data = snapshot.val();
              const name = data.name || data.Name || data["Name of the student"] || data.studentName;
              if (name) {
                console.log(`[StudentData] Found name at students/${rollNumber}: ${name}`);
                setStudentName(name);
                const section = data.section || data.Section || data.SECTION || null;
                setStudentSection(section);
                const isValidRollNumber = isValidSectionBRollNumber(rollNumber);
                setIsEligibleForAttendance(isValidRollNumber);
                return;
              }
            }
          } catch (e) {
            console.log("[StudentData] students/{rollNumber} path failed, trying alternatives...");
          }

          // Try users path
          try {
            const usersRef = ref(database, `users/${rollNumber}`);
            const snapshot = await get(usersRef);
            if (snapshot.exists()) {
              const data = snapshot.val();
              const name = data.name || data.Name || data["Name of the student"] || data.studentName;
              if (name) {
                console.log(`[StudentData] Found name at users/${rollNumber}: ${name}`);
                setStudentName(name);
                const section = data.section || data.Section || data.SECTION || null;
                setStudentSection(section);
                const isValidRollNumber = isValidSectionBRollNumber(rollNumber);
                setIsEligibleForAttendance(isValidRollNumber);
                return;
              }
            }
          } catch (e) {
            console.log("[StudentData] users/{rollNumber} path failed, trying root search...");
          }

          // Try root-level search (students stored with numeric keys)
          try {
            const rootRef = ref(database);
            const snapshot = await get(rootRef);
            if (snapshot.exists()) {
              const allData = snapshot.val();
              for (const key in allData) {
                // Skip system paths
                if (['attendance', 'notifications', 'schedules', 'clubs', 'exams', 'jobs', 'users', 'students'].includes(key)) continue;

                const student = allData[key];
                if (student && typeof student === 'object') {
                  const studentRoll = student["ROLL NO"] || student.rollNumber || student.collegeId || student["Roll No"];
                  if (studentRoll === rollNumber) {
                    const name = student["Name of the student"] || student.Name || student.name || student.studentName;
                    if (name) {
                      console.log(`[StudentData] Found name at root/${key}: ${name}`);
                      setStudentName(name);
                      const section = student.Section || student.SECTION || student.section || null;
                      setStudentSection(section);
                      const isValidRollNumber = isValidSectionBRollNumber(rollNumber);
                      setIsEligibleForAttendance(isValidRollNumber);
                      return;
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.log("[StudentData] Root search via SDK failed:", e);
          }
        }

        // Strategy 2: Fallback to REST API fetch with auth token
        console.log("[StudentData] Falling back to REST API...");
        const databaseUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://campverse-2004-default-rtdb.asia-southeast1.firebasedatabase.app";

        // Get auth token for authenticated requests
        let authToken = "";
        if (auth?.currentUser) {
          try {
            authToken = await auth.currentUser.getIdToken();
            console.log("[StudentData] Got auth token for REST requests");
          } catch (e) {
            console.log("[StudentData] Could not get auth token:", e);
          }
        }

        // Build auth query parameter
        const authQuery = authToken ? `?auth=${authToken}` : "";

        // Try specific student paths first
        const paths = [
          `${databaseUrl}/students/${rollNumber}.json${authQuery}`,
          `${databaseUrl}/users/${rollNumber}.json${authQuery}`,
        ];

        for (const path of paths) {
          try {
            const response = await fetch(path);
            if (response.ok) {
              const data = await response.json();
              if (data) {
                const name = data.name || data.Name || data["Name of the student"] || data.studentName;
                if (name) {
                  console.log(`[StudentData] Found name via REST at ${path}: ${name}`);
                  setStudentName(name);
                  const section = data.section || data.Section || data.SECTION || null;
                  setStudentSection(section);
                  const isValidRollNumber = isValidSectionBRollNumber(rollNumber);
                  setIsEligibleForAttendance(isValidRollNumber);
                  return;
                }
              }
            }
          } catch (e) {
            // Continue to next path
          }
        }

        // Try root-level search via REST with auth
        const rootResponse = await fetch(`${databaseUrl}/.json${authQuery}`);
        if (rootResponse.ok) {
          const allData = await rootResponse.json();
          if (allData) {
            // First, check if rollNumber is used as direct key
            if (allData[rollNumber] && typeof allData[rollNumber] === 'object') {
              const student = allData[rollNumber];
              const name = student["Name of the student"] || student.Name || student.name || student.studentName;
              if (name) {
                console.log(`[StudentData] Found name via direct key ${rollNumber}: ${name}`);
                setStudentName(name);
                const section = student.Section || student.SECTION || student.section || null;
                setStudentSection(section);
                const isValidRollNumber = isValidSectionBRollNumber(rollNumber);
                setIsEligibleForAttendance(isValidRollNumber);
                return;
              }
            }

            // Search through all keys for ROLL NO field match
            for (const key in allData) {
              // Skip system paths
              if (['attendance', 'notifications', 'schedules', 'clubs', 'exams', 'jobs', 'users', 'students'].includes(key)) continue;

              const student = allData[key];
              if (student && typeof student === 'object') {
                const studentRoll = student["ROLL NO"] || student.rollNumber || student.collegeId || student["Roll No"];
                if (studentRoll === rollNumber) {
                  const name = student["Name of the student"] || student.Name || student.name || student.studentName;
                  if (name) {
                    console.log(`[StudentData] Found name via REST root search: ${name}`);
                    setStudentName(name);
                    const section = student.Section || student.SECTION || student.section || null;
                    setStudentSection(section);
                    const isValidRollNumber = isValidSectionBRollNumber(rollNumber);
                    setIsEligibleForAttendance(isValidRollNumber);
                    return;
                  }
                }
              }
            }
          }
        } else {
          console.log(`[StudentData] REST API returned ${rootResponse.status}: ${rootResponse.statusText}`);
        }

        // If no name found, log and set eligibility based on roll number
        console.log(`[StudentData] No student name found for ${rollNumber}`);
        const isValidRollNumber = isValidSectionBRollNumber(rollNumber);
        setIsEligibleForAttendance(isValidRollNumber);

      } catch (error) {
        console.error("[StudentData] Error fetching student data:", error);
        // Still set eligibility on error
        const isValidRollNumber = isValidSectionBRollNumber(rollNumber);
        setIsEligibleForAttendance(isValidRollNumber);
      }
    };

    fetchStudentData();
  }, [userData?.collegeId]);

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

  // Initialize today's schedule - load from admin-configured schedules or use defaults
  useEffect(() => {
    const currentTime = formatTime(serverTime);

    // Get current day of week - if Sunday, show Monday's schedule
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let today = days[serverTime.getDay()];

    // If it's Sunday, show Monday's schedule as preview
    if (today === "Sunday") {
      today = "Monday";
      console.log("[Schedule] Today is Sunday, showing Monday's schedule as preview");
    }

    // Try to load schedule from localStorage (set by admin scheduler)
    let scheduleData: { subjectCode: string; subjectName: string; startTime: string; endTime: string }[] | null = null;

    try {
      const scheduleConfig = localStorage.getItem("campverse_schedule_config");
      console.log("[Schedule] Checking localStorage for schedule config...");

      if (scheduleConfig) {
        const config = JSON.parse(scheduleConfig);
        console.log("[Schedule] Found config:", Object.keys(config));

        // Try to match student's section (e.g., 22_05_B for CSE-B 2022 batch)
        // Try multiple key formats to find a match
        const possibleKeys = [
          studentSection ? `22_05_${studentSection}` : null,
          "22_05_B", // Default CSE-B 2022
          Object.keys(config)[0] // First available schedule
        ].filter(Boolean);

        let sectionSchedule = null;
        let matchedKey = null;

        for (const key of possibleKeys) {
          if (key && config[key]) {
            sectionSchedule = config[key];
            matchedKey = key;
            break;
          }
        }

        if (sectionSchedule) {
          console.log("[Schedule] Matched section key:", matchedKey);
          const todayScheduleData = sectionSchedule.find((d: any) => d.day === today);

          if (todayScheduleData?.slots && todayScheduleData.slots.length > 0) {
            scheduleData = todayScheduleData.slots.map((slot: any) => ({
              subjectCode: slot.subjectCode || "",
              subjectName: slot.subjectName || "No Subject",
              startTime: slot.startTime || "09:00",
              endTime: slot.endTime || "10:00",
            }));
            console.log("[Schedule] ✓ Loaded admin-configured schedule for", today, "with", scheduleData.length, "slots");
          } else {
            console.log("[Schedule] No slots found for", today, "in section schedule");
          }
        } else {
          console.log("[Schedule] No matching section schedule found. Available keys:", Object.keys(config));
        }
      } else {
        console.log("[Schedule] No schedule config in localStorage");
      }
    } catch (error) {
      console.log("[Schedule] Error loading schedule config:", error);
    }

    // Format time for display (e.g., "09:00" -> "9:00 AM")
    const formatTimeDisplay = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    // Build schedule from loaded data or use defaults
    const initialSchedule: DailyScheduleItem[] = scheduleData ? scheduleData.map((slot, idx) => ({
      slotId: `slot_${idx + 1}`,
      slotNumber: idx + 1,
      time: `${formatTimeDisplay(slot.startTime)} - ${formatTimeDisplay(slot.endTime)}`,
      subjectCode: slot.subjectCode,
      subjectName: slot.subjectName,
      status: "NOT_MARKED" as const,
      isSlotOpen: isSlotOpen(currentTime, slot.endTime.replace(':', ':'), 15),
      canMark: false,
    })) : [
      // Default schedule if no admin-configured schedule exists
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

    console.log("[Schedule] Final schedule has", initialSchedule.length, "slots:",
      initialSchedule.map(s => s.subjectName).join(", "));

    setTodaySchedule(initialSchedule);
  }, [serverTime, studentSection]);

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

  // Automatic attendance marking after 4:00 PM (16:00)
  // If faculty/admin hasn't marked attendance, auto-mark ALL students as PRESENT
  useEffect(() => {
    if (!isEligibleForAttendance) return;

    const checkAndAutoMark = async () => {
      // Check if it's 4:00 PM (16:00) or later
      if (shouldAutoMarkAsPresent(serverTime)) {
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

    // Check immediately and then every minute
    checkAndAutoMark();
    const interval = setInterval(checkAndAutoMark, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [serverTime, isEligibleForAttendance, todaySchedule]);

  // Load performance metrics - fetches historical attendance across ALL dates
  useEffect(() => {
    if (!userData?.collegeId || !isEligibleForAttendance) return;

    const loadHistoricalMetrics = async () => {
      const subjects = [
        { subjectCode: "22CS401", subjectName: "Linux programming" },
        { subjectCode: "22HS301", subjectName: "Business Economics and Financial Analysis" },
        { subjectCode: "22HS501", subjectName: "Professional Elective-lll" },
        { subjectCode: "22HS601", subjectName: "Professional Elective-lV" },
      ];

      try {
        const metrics = await getHistoricalSubjectAttendance(
          userData.collegeId,
          "22", // year
          "05", // branch (CSE)
          "B",  // section
          subjects
        );

        setPerformanceMetrics(metrics);

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
  }, [userData?.collegeId, isEligibleForAttendance, todaySchedule]);

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

          {/* Netflix-style Event Showcase */}
          <EventShowcase />

          {/* Today's Schedule & Attendance */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <div>
                <CardTitle className="text-xl">Today's Schedule & Attendance</CardTitle>
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
                        "flex items-center justify-between p-4 rounded-lg transition-all duration-300",
                        bgClass,
                        borderClass
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
                      <div className="flex items-center gap-2">
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Calculate totals from historical + today's data */}
              {(() => {
                // Get historical totals from performance metrics
                const historicalPresent = performanceMetrics.reduce((sum, m) => sum + m.attended, 0);
                const historicalTotal = performanceMetrics.reduce((sum, m) => sum + m.totalClasses, 0);
                const historicalAbsent = historicalTotal - historicalPresent;

                // Today's not marked count
                const todayNotMarked = todaySchedule.filter(s => s.status === "NOT_MARKED").length;
                const todayPresent = todaySchedule.filter(s => s.status === "PRESENT").length;
                const todayAbsent = todaySchedule.filter(s => s.status === "ABSENT").length;

                // Combined totals (historical + today's marked)
                const totalClasses = historicalTotal + todaySchedule.length;
                const totalPresent = historicalPresent + todayPresent;
                const totalAbsent = historicalAbsent + todayAbsent;
                const percentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

                return (
                  <div className="grid grid-cols-5 gap-4">
                    <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="text-2xl font-bold text-blue-500">{totalClasses}</div>
                      <div className="text-xs text-muted-foreground">Total Classes</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="text-2xl font-bold text-green-500">{totalPresent}</div>
                      <div className="text-xs text-muted-foreground">Present</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="text-2xl font-bold text-red-500">{totalAbsent}</div>
                      <div className="text-xs text-muted-foreground">Absent</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-gray-500/10 border border-gray-500/20">
                      <div className="text-2xl font-bold text-gray-500">{todayNotMarked}</div>
                      <div className="text-xs text-muted-foreground">Not Marked</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className={cn(
                        "text-2xl font-bold",
                        percentage >= 76 ? "text-green-500" :
                          percentage >= 65 ? "text-orange-500" : "text-red-500"
                      )}>
                        {percentage}%
                      </div>
                      <div className="text-xs text-muted-foreground">Attendance</div>
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
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Calendar on left */}
                    <div className="flex-shrink-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md"
                        modifiers={{
                          fullAttendance: (day) => {
                            const dateStr = formatDate(day);
                            return calendarAttendance[dateStr] === 'full';
                          },
                          partialAttendance: (day) => {
                            const dateStr = formatDate(day);
                            return calendarAttendance[dateStr] === 'partial';
                          },
                          absentFull: (day) => {
                            const dateStr = formatDate(day);
                            return calendarAttendance[dateStr] === 'absent';
                          },
                          sunday: (day) => day.getDay() === 0,
                        }}
                        modifiersStyles={{
                          fullAttendance: {
                            backgroundColor: 'rgb(34, 197, 94)',
                            color: 'white',
                            borderRadius: '50%',
                          },
                          partialAttendance: {
                            backgroundColor: 'rgb(249, 115, 22)',
                            color: 'white',
                            borderRadius: '50%',
                          },
                          absentFull: {
                            backgroundColor: 'rgb(239, 68, 68)',
                            color: 'white',
                            borderRadius: '50%',
                          },
                          sunday: {
                            color: 'rgb(156, 163, 175)',
                          },
                        }}
                        disabled={(day) => day.getDay() === 0}
                      />
                    </div>

                    {/* Attendance Legend on right */}
                    <div className="flex-1 flex items-center justify-center border-l border-border/50 pl-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-green-500"></div>
                          <span className="text-sm text-foreground">Present</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                          <span className="text-sm text-foreground">Partially Present</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-red-500"></div>
                          <span className="text-sm text-foreground">Absent</span>
                        </div>
                      </div>
                    </div>
                  </div>
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
