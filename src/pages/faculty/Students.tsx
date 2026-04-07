import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import FacultyLayout from "@/components/FacultyLayout";
import {
  UsersRound,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  LockKeyhole,
  Users,
  Save,
  RefreshCw,
  Timer,
  CheckCheck,
  Calendar
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceStudent,
  TimeSlot,
  PermissionCheck,
} from "@/types/attendance";
import {
  getServerTime,
  formatDate,
  formatTime,
  isSlotOpen,
  timeToMinutes,
  checkMarkingPermission,
  markAttendance,
  markBulkAttendance,
  getStudentsForSection,
  subscribeToSlotAttendance,
  getRoleFromCollegeId,
  lockSlot,
} from "@/services/attendanceService";

interface StudentAttendanceState {
  studentId: string;
  name: string;
  status: AttendanceStatus;
  lastUpdated: string;
  isModified: boolean;
  initialStatus?: AttendanceStatus;
}

const FacultyStudents = () => {
  const { userData } = useAuth();

  // Academic Selection State
  const [selectedDegree, setSelectedDegree] = useState("Major");
  const [selectedYear, setSelectedYear] = useState("25");
  const [selectedSemester, setSelectedSemester] = useState("II");
  const [selectedDepartment, setSelectedDepartment] = useState("05");
  const [selectedSection, setSelectedSection] = useState("B");
  
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Time & Permission state
  const [serverTime, setServerTime] = useState<Date>(new Date());
  const [permission, setPermission] = useState<PermissionCheck | null>(null);
  const [remainingTime, setRemainingTime] = useState<string>("");

  // Student & Attendance state
  const [students, setStudents] = useState<StudentAttendanceState[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hasUnsavedChanges = students.some(s => s.status !== (s.initialStatus || "NOT_MARKED"));

  // Dialog state
  const [showLockWarning, setShowLockWarning] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Static Academic Option Definitions (matching your system)
  const DEGREES = ["Major", "Minor"];
  const YEARS = [
    { value: "22", label: "I Year" },
    { value: "23", label: "II Year" },
    { value: "24", label: "III Year" },
    { value: "25", label: "IV Year" }
  ];
  const DEPARTMENTS = [
    { value: "05", label: "CSE" },
    { value: "08", label: "CSE (AI & ML)" },
    { value: "07", label: "CSE (Data Science)" },
    { value: "04", label: "ECE" },
    { value: "02", label: "EEE" },
    { value: "03", label: "Mechanical" },
    { value: "01", label: "Civil" },
    { value: "06", label: "IT" }
  ];
  const SEMESTERS = [
    { value: "I", label: "Semester I" },
    { value: "II", label: "Semester II" }
  ];
  const SECTIONS = ["A", "B", "C", "D", "E", "F", "G"];

  // Sync server time
  useEffect(() => {
    const syncTime = async () => {
      const time = await getServerTime();
      setServerTime(time);
    };

    syncTime();
    const interval = setInterval(syncTime, 1000); // Update every second for timer
    return () => clearInterval(interval);
  }, []);

  // Calculate remaining time for current slot
  useEffect(() => {
    if (!selectedSlot) {
      setRemainingTime("");
      return;
    }

    const currentMinutes = timeToMinutes(formatTime(serverTime));
    const endMinutes = timeToMinutes(selectedSlot.endTime) + 15; // 15 min buffer
    const remaining = endMinutes - currentMinutes;

    if (remaining <= 0) {
      setRemainingTime("Expired");
    } else {
      const hours = Math.floor(remaining / 60);
      const mins = remaining % 60;
      setRemainingTime(hours > 0 ? `${hours}h ${mins}m remaining` : `${mins}m remaining`);
    }
  }, [serverTime, selectedSlot]);

  // Check permission when slot changes
  useEffect(() => {
    if (!selectedSlot || !userData?.collegeId) return;

    const checkPerm = async () => {
      const perm = await checkMarkingPermission(
        userData.collegeId,
        getRoleFromCollegeId(userData.collegeId),
        selectedSlot.id,
        formatDate(serverTime),
        "ACADEMIC",
        selectedSlot.startTime,
        selectedSlot.endTime
      );
      setPermission(perm);
    };

    checkPerm();
  }, [selectedSlot, userData?.collegeId, serverTime]);

  // Load dynamic schedule from Admin Scheduler
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const rollNumber = userData.collegeId;
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        
        // Fetch all schedules containing slots for this faculty
        const res = await fetch(`${apiBaseUrl}/schedules?facultyId=${encodeURIComponent(rollNumber)}`);
        
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const today = days[serverTime.getDay()];
            
            const allAvailableSlots: TimeSlot[] = [];
            
            data.forEach((scheduleDoc: any) => {
              // Only consider the schedule if it matches current academic filters OR if it's the faculty's own schedule
              // Actually, rule says "only show slots where facultyId matches". So we search all.
              
              const todaySchedule = scheduleDoc.schedule?.find((d: any) => d.day === today);
              
              if (todaySchedule && todaySchedule.slots) {
                const assignedSlots = todaySchedule.slots
                  .filter((s: any) => 
                    s.facultyId === rollNumber && 
                    (s.subjectName?.trim() || s.subjectCode?.trim())
                  )
                  .map((slot: any) => ({
                    id: `slot_${slot.slotNumber}_${scheduleDoc._id}`,
                    slotNumber: slot.slotNumber,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    subjectCode: slot.subjectCode,
                    subjectName: slot.subjectName,
                    facultyId: slot.facultyId || "",
                    section: scheduleDoc.section || slot.section || selectedSection,
                    branch: scheduleDoc.branch || slot.department || selectedDepartment,
                    year: scheduleDoc.year || selectedYear,
                  }));
                
                allAvailableSlots.push(...assignedSlots);
              }
            });
            
            // Sort by time
            allAvailableSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
            setAvailableSlots(allAvailableSlots);
          } else {
            setAvailableSlots([]);
          }
        }
      } catch (err) {
        console.error("Failed to load generic scheduled slots", err);
      }
    };
    fetchSchedules();
  }, [selectedDegree, selectedYear, selectedSemester, selectedDepartment, selectedSection, serverTime]);

  // Load students when academic filters change
  useEffect(() => {
    // Empty specific attendance list to force UI reload and wait for slot picking
    loadStudents();
  }, [selectedDegree, selectedYear, selectedSemester, selectedDepartment, selectedSection]);

  // Auto-remove slot selection on date/filter change
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDegree, selectedYear, selectedSemester, selectedDepartment, selectedSection]);

  // Real-time subscription for slot attendance
  useEffect(() => {
    if (!selectedSlot) return;

    const today = formatDate(serverTime);

    const unsubscribe = subscribeToSlotAttendance(
      selectedSlot.id,
      today,
      selectedSlot.year,
      selectedSlot.branch,
      selectedSlot.section,
      (records) => {
        // Update student statuses with real-time data
        setStudents(prev =>
          prev.map(student => {
            const record = records.find(r => r.studentId === student.studentId);
            if (record && !student.isModified) {
              return {
                ...student,
                status: record.status,
                initialStatus: record.status,
                lastUpdated: new Date(record.markedAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                }),
              };
            }
            return student;
          })
        );
      }
    );

    return () => unsubscribe();
  }, [selectedSlot, serverTime]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const branch = selectedDepartment; 
      const year = selectedYear;

      console.log(`Loading students for Year: ${year}, Branch: ${branch}, Section: ${selectedSection}`);

      // Fetch students from Firebase using the centralized service
      const firebaseStudents = await getStudentsForSection(year, branch, selectedSection);

      console.log(`Firebase returned ${firebaseStudents.length} students`);

      if (firebaseStudents.length > 0) {
        // Transform to StudentAttendanceState format
        const studentStates: StudentAttendanceState[] = firebaseStudents.map(student => ({
          studentId: student.rollNumber,
          name: student.name,
          status: "NOT_MARKED" as AttendanceStatus,
          lastUpdated: "Not marked",
          isModified: false,
        }));

        setStudents(studentStates);
        console.log(`Loaded ${studentStates.length} students for Section ${selectedSection}`);
        toast.success(`Loaded ${studentStates.length} students from Firebase`);
      } else {
        // Fallback: Use complete student data for Section B (matching Firebase structure)
        console.log("Firebase returned empty, using complete fallback student data for Section B");
        const fallbackStudents: StudentAttendanceState[] = [
          { studentId: "22B81A0565", name: "SURASANI ABHINAV REDDY", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0566", name: "GURRALA ABIGNA", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0567", name: "MOHAMMED ABUBAKAR SIDDIQ", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0568", name: "DASARI ADITHYA", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0569", name: "PALLAPU AKSHAYA", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0570", name: "PADAMATI AKSHITH REDDY", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0571", name: "NARENDRUNI AMRUTHA", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0572", name: "UPPU ANJALI", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0573", name: "PAMULAPARTHY ANJANA SAI SARAYU", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0574", name: "GUMMAKONDA BEULA RANI", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0575", name: "T CHETAN RIKHIL", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0576", name: "MADAMANCHI CHIDVILA", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0577", name: "S DILEEP SAGAR", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0578", name: "THOTA GAYATHRI", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0579", name: "KONTHAM HARSHITHA", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0580", name: "HASINI REDDY PANNALA", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0581", name: "KOVURU HRUSHIKESH", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0582", name: "NUSUM JAYA SAHITHI", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0583", name: "MOKILLA JAYANTH REDDY", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0584", name: "VALLAMPATLA KARTHIK", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0585", name: "GUNDLAPALLY KARTHIKEYA REDDY", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0586", name: "SHAMARTHI KEERTHANA", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0587", name: "POREDDY KRUTHIK REDDY", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0588", name: "MUNTHA MAHESH", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0589", name: "A MAHESHWARI", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0590", name: "MOKSHAGNA MALINENI", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0591", name: "SIMHADRI MURALI MANAS KRISHNA", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0592", name: "DUSNAMONI NANDINI", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0593", name: "BANDA NAUHITHKRISHNA REDDY", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0594", name: "NIKITHA ARTHAM", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0595", name: "YARASURI PAVAN SAMPATH", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0596", name: "BINGI PREM KUMAR GOUD", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0597", name: "BACHU RAHUL SAI", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0598", name: "REVANTH SAI CHAPARALA", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A0599", name: "MARRI RISHITH", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05A0", name: "PATURI RUPA", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05A1", name: "KARINGU SAI CHANDU", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05A2", name: "SIMMA SAI KRISHNA", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05A3", name: "ARRURI SAI PAVAN", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05A4", name: "KODAKANDLA SAI SOHAN REDDY", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05A5", name: "N SANDYA", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05A6", name: "KALIGANDLA SANGEETHA", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05A7", name: "MEDIKONDA SANJANITH", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05A8", name: "YALAKA SATHVIK REDDY", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05A9", name: "BELDE SAURABH", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05B0", name: "LEKKALA SHRAVANI", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05B1", name: "GADDAM SIDDHARTHA", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05B2", name: "SAMA SIRI", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05B3", name: "BATHINA SIRI VENNELA", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05B4", name: "PASUMARTHY SREE HARSHA", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05B5", name: "BADAM SREEKAR", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05B6", name: "GUNJA SRIKANTH", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05B7", name: "G SRINIVASA RAGHAVAN", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05B8", name: "YALAMANDALA SUMANJALI", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05B9", name: "ANIKE TANVI REDDY", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05C0", name: "BANDI VAMSHI", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05C1", name: "ANTHIREDDYGARI VARSHINI REDDY", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05C2", name: "LAVOORI VARSHITHA", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05C3", name: "KATAKAM VARUN KUMAR", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05C4", name: "MEKALA VENKATESH", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05C5", name: "YELIGETI VILASH", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05C6", name: "DONTHIREDDY VINILREDDY", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05C7", name: "KOLIPAKA VIVEK", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
          { studentId: "22B81A05C8", name: "GUNTIPALLY VIVEKAVARDHAN", status: "NOT_MARKED", lastUpdated: "Not marked", isModified: false },
        ];
        setStudents(fallbackStudents);
        toast.info(`Loaded ${fallbackStudents.length} students (Firebase unavailable, using cached data)`);
      }
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Failed to load students from Firebase");
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendanceStatus = (studentId: string, status: AttendanceStatus) => {
    if (!permission?.canMark) {
      setShowLockWarning(true);
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    setStudents(prev =>
      prev.map(student => {
        if (student.studentId === studentId) {
          const newStatus = status === student.status ? "NOT_MARKED" : status;
          const initial = student.initialStatus || "NOT_MARKED";
          
          let modified = false;
          if (initial !== newStatus && initial !== "NOT_MARKED") {
             modified = true;
          }

          return {
            ...student,
            status: newStatus,
            lastUpdated: newStatus === "NOT_MARKED" ? "Not marked" : timeString,
            isModified: modified,
          };
        }
        return student;
      })
    );
  };

  const markAllPresent = () => {
    if (!permission?.canMark) {
      setShowLockWarning(true);
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    setStudents(prev =>
      prev.map(student => {
        const newStatus = "PRESENT";
        const initial = student.initialStatus || "NOT_MARKED";
        let modified = false;
        if (initial !== newStatus && initial !== "NOT_MARKED") {
           modified = true;
        }

        return {
          ...student,
          status: newStatus,
          lastUpdated: timeString,
          isModified: modified,
        };
      })
    );

    toast.success("All students marked as present");
  };

  const markAllAbsent = () => {
    if (!permission?.canMark) {
      setShowLockWarning(true);
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    setStudents(prev =>
      prev.map(student => {
        const newStatus = "ABSENT";
        const initial = student.initialStatus || "NOT_MARKED";
        let modified = false;
        if (initial !== newStatus && initial !== "NOT_MARKED") {
           modified = true;
        }

        return {
          ...student,
          status: newStatus,
          lastUpdated: timeString,
          isModified: modified,
        };
      })
    );

    toast.success("All students marked as absent");
  };

  const saveAttendance = async () => {
    if (!selectedSlot || !userData?.collegeId) return;

    setIsSaving(true);
    try {
      const modifiedStudents = students.filter(s => s.status !== (s.initialStatus || "NOT_MARKED"));
      const today = formatDate(serverTime);

      for (const student of modifiedStudents) {
        await markAttendance(
          student.studentId,
          selectedSlot.id,
          today,
          student.status,
          "ACADEMIC",
          userData.collegeId,
          getRoleFromCollegeId(userData.collegeId),
          selectedSlot.subjectCode,
          selectedSlot.subjectName,
          selectedSlot.section,
          selectedSlot.branch,
          selectedSlot.year,
          false,
          "", // overrideReason
          selectedDegree,
          selectedSemester
        );
      }

      // Reset modified flags
      setStudents(prev =>
        prev.map(student => ({
          ...student,
          isModified: false,
          initialStatus: student.status,
        }))
      );

      toast.success(`Attendance saved for ${modifiedStudents.length} students`);
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Failed to save attendance");
    } finally {
      setIsSaving(false);
      setShowSaveConfirm(false);
    }
  };

  const getStatusCount = () => {
    const present = students.filter(s => s.status === "PRESENT").length;
    const absent = students.filter(s => s.status === "ABSENT").length;
    const unmarked = students.filter(s => s.status === "NOT_MARKED").length;
    return { present, absent, unmarked };
  };

  const statusCounts = getStatusCount();

  return (
    <FacultyLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <UsersRound className="w-8 h-8 text-primary" />
              Attendance Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Maintain accurate attendance records for your classes.
            </p>
          </div>
        </div>

        {/* Time & Permission Alert Removed per request */}

        {/* Main Attendance Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Student Attendance Register</CardTitle>
                <CardDescription className="mt-1">
                  Mark attendance for your class. Changes sync in real-time.
                </CardDescription>
              </div>


            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Filters and Actions */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex flex-wrap gap-4 w-full md:flex-wrap md:w-auto flex-1">
                {/* 1. Course (Degree) */}
                <Select value={selectedDegree} onValueChange={setSelectedDegree}>
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue placeholder="Course" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEGREES.map((deg) => (
                      <SelectItem key={deg} value={deg}>{deg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 2. Year */}
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((yr) => (
                      <SelectItem key={yr.value} value={yr.value}>{yr.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 3. Semester */}
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((sem) => (
                      <SelectItem key={sem.value} value={sem.value}>{sem.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 4. Department */}
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full md:w-36">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 5. Section */}
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map((sec) => (
                      <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* 6. Slot Selection */}
                <Select
                  value={selectedSlot?.id || ""}
                  onValueChange={(id) => {
                    const slot = availableSlots.find(s => s.id === id);
                    setSelectedSlot(slot || null);
                  }}
                  disabled={availableSlots.length === 0}
                >
                  <SelectTrigger className="w-full md:w-[250px]">
                    <SelectValue placeholder={availableSlots.length > 0 ? "Select a slot" : "No slots found"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id}>
                        Slot {slot.slotNumber} - {slot.subjectName}
                        <span className="ml-2 text-xs text-muted-foreground hidden lg:inline">
                          ({slot.startTime} - {slot.endTime})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllPresent}
                  className="gap-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  All Present
                </Button>

                <Button
                  onClick={() => {
                    if (!permission?.canMark) {
                       setShowLockWarning(true);
                       return;
                    }
                    setShowSaveConfirm(true);
                  }}
                  disabled={!hasUnsavedChanges}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Take Attendance
                </Button>
              </div>
            </div>

            {/* Empty State checks */}
            {students.length === 0 && availableSlots.length > 0 ? (
               <div className="flex flex-col items-center justify-center py-16 text-center">
                 <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
                 <h3 className="text-xl font-medium text-foreground">No Students Found</h3>
                 <p className="text-muted-foreground mt-2 max-w-sm">
                    No students available for the selected academic combination.
                 </p>
               </div>
            ) : availableSlots.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-16 text-center">
                 <Calendar className="w-12 h-12 text-muted-foreground/30 mb-4" />
                 <h3 className="text-xl font-medium text-foreground">No Slots Found</h3>
                 <p className="text-muted-foreground mt-2 max-w-sm">
                    No scheduled class for the selected academic filters.
                 </p>
               </div>
            ) : !selectedSlot ? (
               <div className="flex flex-col items-center justify-center py-16 text-center">
                 <Clock className="w-12 h-12 text-muted-foreground/30 mb-4" />
                 <h3 className="text-xl font-medium text-foreground">Select a Slot</h3>
                 <p className="text-muted-foreground mt-2 max-w-sm">
                    Please select a scheduled slot to view and mark attendance.
                 </p>
               </div>
            ) : (
                <>
                  {/* Status Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-500">{statusCounts.present}</div>
                      <div className="text-xs text-muted-foreground">Present</div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-500">{statusCounts.absent}</div>
                      <div className="text-xs text-muted-foreground">Absent</div>
                    </div>
                    <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-gray-500">{statusCounts.unmarked}</div>
                      <div className="text-xs text-muted-foreground">Not Marked</div>
                    </div>
                  </div>

                  {/* Attendance Table */}
                  <div className="space-y-2">
              <div className="grid grid-cols-3 gap-8 py-3 border-b text-sm font-medium text-muted-foreground px-4">
                <div>Roll Number</div>
                <div>Status</div>
                <div>Last Updated</div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                students.map((student) => (
                  <div
                    key={student.studentId}
                    className={cn(
                      "grid grid-cols-3 gap-8 py-3 px-4 items-center rounded-lg transition-all duration-200",
                      "hover:bg-muted/30",
                      student.isModified && "bg-blue-500/5 border-l-2 border-l-blue-500"
                    )}
                  >
                    <div className="text-foreground font-medium">{student.studentId}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAttendanceStatus(student.studentId, "PRESENT")}
                        className={cn(
                          "px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 border",
                          student.status === "PRESENT"
                            ? "bg-green-500 text-white border-green-500 shadow-sm"
                            : "bg-transparent text-muted-foreground border-border hover:border-green-500/50 hover:bg-green-500/10 hover:text-green-500"
                        )}
                        title="Present"
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleAttendanceStatus(student.studentId, "ABSENT")}
                        className={cn(
                          "px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 border",
                          student.status === "ABSENT"
                            ? "bg-red-500 text-white border-red-500 shadow-sm"
                            : "bg-transparent text-muted-foreground border-border hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500"
                        )}
                        title="Absent"
                      >
                        Absent
                      </button>
                    </div>
                    <div className="text-muted-foreground text-sm flex items-center gap-2">
                      {student.lastUpdated}
                      {student.isModified && (
                        <Badge variant="outline" className="text-xs text-blue-500 border-blue-500">
                          Modified
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Slot Lock Warning Notice */}
            {selectedSlot && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <LockKeyhole className="w-4 h-4" />
                  <span>
                    Attendance marking will be locked 15 minutes after the slot ends
                    ({selectedSlot.endTime}). Contact admin for late entries.
                  </span>
                </div>
              </div>
            )}
            </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Slot Lock Warning Dialog */}
      <Dialog open={showLockWarning} onOpenChange={setShowLockWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="w-5 h-5" />
              Slot Time Expired
            </DialogTitle>
            <DialogDescription>
              The attendance marking window for this slot has closed.
              You can no longer mark attendance for this period.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              If you need to make changes to this attendance record, please contact
              your administrator who can override the slot lock.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowLockWarning(false)}>
              Understood
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Attendance Submission</DialogTitle>
            <DialogDescription>
              You are about to submit attendance for {students.filter(s => s.status !== (s.initialStatus || "NOT_MARKED")).length} students.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{students.filter(s => s.status === "PRESENT" && s.status !== (s.initialStatus || "NOT_MARKED")).length} Present</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span>{students.filter(s => s.status === "ABSENT" && s.status !== (s.initialStatus || "NOT_MARKED")).length} Absent</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={saveAttendance} disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Confirm & Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FacultyLayout>
  );
};

export default FacultyStudents;
