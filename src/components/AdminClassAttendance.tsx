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
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  RefreshCw,
  UsersRound,
  AlertTriangle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AttendanceStatus, TimeSlot } from "@/types/attendance";
import {
  formatDate,
  markAttendance,
  getStudentsForSection,
  subscribeToSlotAttendance,
  getRoleFromCollegeId,
} from "@/services/attendanceService";

interface StudentAttendanceState {
  studentId: string;
  name: string;
  status: AttendanceStatus;
  lastUpdated: string;
  isModified: boolean;
}

export const AdminClassAttendance = ({
  onStatsUpdate
}: {
  onStatsUpdate?: (stats: {
    totalStudents: number | null;
    averageAttendance: number | null;
    belowThreshold: number | null;
    perfectAttendance: number | null;
  }) => void;
}) => {
  const { userData } = useAuth();

  // Academic Filters
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedDegree, setSelectedDegree] = useState("Major");
  const [selectedYear, setSelectedYear] = useState("25");
  const [selectedSemester, setSelectedSemester] = useState("I");
  const [selectedDepartment, setSelectedDepartment] = useState("05");
  const [selectedSection, setSelectedSection] = useState("B");

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [students, setStudents] = useState<StudentAttendanceState[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const DEGREES = ["Major", "Minor"];
  const YEARS = [
    { value: "22", label: "I Year" },
    { value: "23", label: "II Year" },
    { value: "24", label: "III Year" },
    { value: "25", label: "IV Year" },
  ];
  const DEPARTMENTS = [
    { value: "05", label: "CSE" },
    { value: "08", label: "CSE (AI & ML)" },
    { value: "07", label: "CSE (Data Science)" },
    { value: "04", label: "ECE" },
    { value: "02", label: "EEE" },
    { value: "03", label: "Mechanical" },
    { value: "01", label: "Civil" },
    { value: "06", label: "IT" },
  ];
  const SEMESTERS = [
    { value: "I", label: "Semester I" },
    { value: "II", label: "Semester II" },
    { value: "III", label: "Semester III" },
    { value: "IV", label: "Semester IV" },
    { value: "V", label: "Semester V" },
    { value: "VI", label: "Semester VI" },
    { value: "VII", label: "Semester VII" },
    { value: "VIII", label: "Semester VIII" },
  ];
  const SECTIONS = ["A", "B", "C", "D", "E", "F", "G"];

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const params = new URLSearchParams({
          scheduleType: "student",
          degree: selectedDegree,
          year: selectedYear,
          semester: selectedSemester,
          branch: selectedDepartment,
          section: selectedSection,
        });

        const res = await fetch(`${apiBaseUrl}/schedules?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const dateObj = new Date(selectedDate);
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const selectedDay = days[dateObj.getDay()];

            const activeSchedule = data.find((doc: any) =>
              doc.degree === selectedDegree &&
              doc.year === selectedYear &&
              doc.semester === selectedSemester &&
              doc.branch === selectedDepartment &&
              doc.section === selectedSection
            ) || data[0];

            const targetDaySchedule = activeSchedule.schedule?.find((d: any) => d.day === (selectedDay === "Sunday" ? "Monday" : selectedDay));

            if (targetDaySchedule && targetDaySchedule.slots) {
              const slots: TimeSlot[] = targetDaySchedule.slots
                .filter((s: any) => s.subjectName || s.subjectCode)
                .map((slot: any) => ({
                  id: `slot_${slot.slotNumber}`,
                  slotNumber: slot.slotNumber,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  subjectCode: slot.subjectCode,
                  subjectName: slot.subjectName,
                  facultyId: slot.faculty || "",
                  section: activeSchedule.section || selectedSection,
                  branch: activeSchedule.branch || selectedDepartment,
                  year: activeSchedule.year || selectedYear,
                }));
              setAvailableSlots(slots);
            } else {
              setAvailableSlots([]);
            }
          } else {
            setAvailableSlots([]);
          }
        }
      } catch (err) {
        console.error("Failed to load schedules", err);
      }
    };
    fetchSchedules();
  }, [selectedDegree, selectedYear, selectedSemester, selectedDepartment, selectedSection, selectedDate]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const yearPrefix = selectedYear;
      const branchCode = selectedDepartment;
      const firebaseStudents = await getStudentsForSection(yearPrefix, branchCode, selectedSection);

      const studentStates: StudentAttendanceState[] = firebaseStudents.map(s => ({
        studentId: s.rollNumber,
        name: s.name,
        status: "NOT_MARKED",
        lastUpdated: "",
        isModified: false,
      }));

      studentStates.sort((a, b) => a.studentId.localeCompare(b.studentId));
      setStudents(studentStates);
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    setSelectedSlot(null);
  }, [selectedDegree, selectedYear, selectedSemester, selectedDepartment, selectedSection, selectedDate]);

  useEffect(() => {
    if (!selectedSlot) return;

    const unsubscribe = subscribeToSlotAttendance(
      selectedSlot.id,
      selectedDate,
      selectedYear,
      selectedDepartment,
      selectedSection,
      (records) => {
        setStudents(prev => {
          const fresh = [...prev];
          let updated = false;

          for (const record of records) {
            const idx = fresh.findIndex(s => s.studentId === record.studentId);
            if (idx !== -1 && !fresh[idx].isModified) {
              if (fresh[idx].status !== record.status) {
                fresh[idx] = {
                  ...fresh[idx],
                  status: record.status,
                  lastUpdated: record.markedAt ? new Date(record.markedAt).toLocaleTimeString() : "",
                };
                updated = true;
              }
            }
          }
          return updated ? fresh : prev;
        });
      }
    );

    return () => unsubscribe();
  }, [selectedSlot, selectedDate, selectedYear, selectedDepartment, selectedSection]);

  // Handle stats updates
  useEffect(() => {
    if (!onStatsUpdate) return;

    if (isLoading || !selectedSlot || students.length === 0) {
      onStatsUpdate({
        totalStudents: null,
        averageAttendance: null,
        belowThreshold: null,
        perfectAttendance: null,
      });
      return;
    }

    const markedStudents = students.filter(s => s.status !== 'NOT_MARKED');
    
    // If no one is marked yet, attendance data is "not available"
    if (markedStudents.length === 0) {
      onStatsUpdate({
        totalStudents: students.length,
        averageAttendance: null,
        belowThreshold: null,
        perfectAttendance: null,
      });
      return;
    }

    let sumPercentages = 0;
    let belowThreshold = 0;
    let perfectAttendance = 0;

    students.forEach(s => {
      // Calculate individual percentage based on current slot marked status
      // If student is not marked or absent, their percentage for this specific slot record is 0%
      const pct = s.status === 'PRESENT' ? 100 : 0;
      sumPercentages += pct;
      
      if (pct < 65) {
        belowThreshold++;
      }
      if (pct >= 75) {
        perfectAttendance++;
      }
    });

    const averageAttendance = Math.round(sumPercentages / students.length);

    onStatsUpdate({
      totalStudents: students.length,
      averageAttendance,
      belowThreshold,
      perfectAttendance
    });

  }, [students, selectedSlot, isLoading, onStatsUpdate]);

  const markAll = (status: AttendanceStatus) => {
    setStudents(prev =>
      prev.map(s => ({
        ...s,
        status,
        isModified: true,
      }))
    );
    setHasUnsavedChanges(true);
  };

  const markIndividual = (studentId: string, status: AttendanceStatus) => {
    setStudents(prev =>
      prev.map(s =>
        s.studentId === studentId
          ? { ...s, status, isModified: true }
          : s
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleSaveAttendance = async () => {
    if (!selectedSlot) return;

    setIsSaving(true);
    try {
      const modifiedStudents = students.filter(s => s.isModified);
      for (const student of modifiedStudents) {
        await markAttendance(
          student.studentId,
          selectedSlot.id,
          selectedDate,
          student.status,
          "ACADEMIC",
          userData?.collegeId || "admin",
          getRoleFromCollegeId(userData?.collegeId || "admin"),
          selectedSlot.subjectCode,
          selectedSlot.subjectName,
          selectedSlot.section,
          selectedSlot.branch,
          selectedSlot.year,
          true, // Is Override
          "Admin Mass Update",
          selectedDegree,
          selectedSemester
        );
      }

      setStudents(prev => prev.map(s => ({ ...s, isModified: false })));
      setHasUnsavedChanges(false);
      toast.success(`Updated attendance for ${modifiedStudents.length} students`);
    } catch (e) {
      console.error("Save error:", e);
      toast.error("Failed to save attendance updates");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm data-[state=open]:animate-in">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[140px]">
              <div className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Date</div>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-secondary/20 border-border/50 rounded-lg text-sm transition-colors focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <div className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Degree</div>
              <Select value={selectedDegree} onValueChange={setSelectedDegree}>
                <SelectTrigger className="w-full bg-secondary/20 border-border/50 rounded-lg text-sm transition-colors focus:ring-1 focus:ring-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEGREES.map((deg) => (
                    <SelectItem key={deg} value={deg}>{deg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[140px]">
              <div className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Year</div>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full bg-secondary/20 border-border/50 rounded-lg text-sm transition-colors focus:ring-1 focus:ring-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[140px]">
              <div className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Semester</div>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-full bg-secondary/20 border-border/50 rounded-lg text-sm transition-colors focus:ring-1 focus:ring-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTERS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[140px]">
              <div className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Department</div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full bg-secondary/20 border-border/50 rounded-lg text-sm transition-colors focus:ring-1 focus:ring-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((branch) => (
                    <SelectItem key={branch.value} value={branch.value}>{branch.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[100px]">
              <div className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Section</div>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-full bg-secondary/20 border-border/50 rounded-lg text-sm transition-colors focus:ring-1 focus:ring-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((sec) => (
                    <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-[2] min-w-[280px]">
              <div className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Slot
              </div>
              <Select 
                value={selectedSlot?.id || "none"} 
                onValueChange={(val) => {
                  if (val === "none") {
                    setSelectedSlot(null);
                  } else {
                    setSelectedSlot(availableSlots.find(s => s.id === val) || null);
                  }
                }}
              >
                <SelectTrigger className={cn(
                  "w-full bg-secondary/20 border-border/50 rounded-lg text-sm transition-all text-left truncate flex items-center justify-between",
                  selectedSlot ? "ring-1 ring-primary/30 bg-primary/5" : ""
                )}>
                  {selectedSlot ? (
                    <div className="flex flex-col truncate w-full text-left pr-2">
                       <span className="font-semibold text-primary truncate block w-full">
                          Slot {selectedSlot.slotNumber} - {selectedSlot.subjectName}
                       </span>
                       <span className="text-xs text-muted-foreground truncate block">
                          {selectedSlot.startTime} - {selectedSlot.endTime}
                       </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Select a time slot...</span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-muted-foreground italic">None</SelectItem>
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id} className="py-2">
                        <div className="flex flex-col">
                          <span className="font-medium">Slot {slot.slotNumber} - {slot.subjectName}</span>
                          <span className="text-xs text-muted-foreground opacity-80">{slot.startTime} - {slot.endTime}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">No classes scheduled</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedSlot ? (
        <Card className="border-border/50 border-dashed bg-secondary/10">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mb-4">
              <UsersRound className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Ready to Track Attendance</h3>
            <p className="text-sm text-muted-foreground max-w-[400px]">
              Select a time slot above to view or override the attendance for this specific section.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50 shadow-lg overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-border/50 bg-secondary/30 flex items-center justify-between sticky top-0 z-10">
            <div className="flex-1 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => markAll("PRESENT")}
                className="hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/30 transition-colors"
                disabled={isLoading}
              >
                Mark All Present
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => markAll("ABSENT")}
                className="hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-colors"
                disabled={isLoading}
              >
                Mark All Absent
              </Button>
            </div>
            
            <div className="flex-1 flex justify-center text-sm">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> {students.filter(s => s.status === "PRESENT").length} Present</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> {students.filter(s => s.status === "ABSENT").length} Absent</span>
                </div>
            </div>

            <div className="flex-1 flex justify-end">
              <Button
                onClick={handleSaveAttendance}
                disabled={!hasUnsavedChanges || isSaving}
                className="gap-2 shadow-sm transition-all w-32 relative"
                variant={hasUnsavedChanges ? "default" : "secondary"}
              >
                <div className={cn("absolute inset-0 bg-primary/10 rounded-md animate-pulse pointer-events-none", hasUnsavedChanges ? "opacity-100" : "opacity-0")}></div>
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Edits
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 bg-background/50 relative">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-background/80 backdrop-blur-sm z-20">
                 <RefreshCw className="w-8 h-8 animate-spin text-primary mb-4" />
                 <p className="text-muted-foreground animate-pulse font-medium">Loading student records...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-background">
                 <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500">
                    <AlertTriangle className="w-8 h-8" />
                 </div>
                 <p className="text-lg font-medium mb-1">No Students Found</p>
                 <p className="text-sm text-muted-foreground max-w-md">No students are mapped to this specific section in the database. Try selecting another active section.</p>
              </div>
            ) : (
              <div className="p-4 grid gap-2">
                {students.map((student, index) => (
                  <div
                    key={student.studentId}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-lg border transition-all duration-200 group relative overflow-hidden",
                      student.isModified ? "border-primary/50 bg-primary/5" : "border-border/40 hover:border-border/80 bg-background",
                      "hover:shadow-md hover:-translate-y-0.5"
                    )}
                  >
                     <div className="flex items-center gap-4 min-w-0 pr-4 z-10">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-medium text-sm border shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                           {index + 1}
                        </div>
                        <div className="min-w-0">
                           <h4 className="font-semibold text-[15px] truncate text-foreground group-hover:text-primary transition-colors">{student.name}</h4>
                           <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm text-muted-foreground font-medium">{student.studentId}</span>
                              {student.lastUpdated && <span className="text-[10px] bg-secondary/50 px-1 rounded text-muted-foreground">Updated {student.lastUpdated}</span>}
                           </div>
                        </div>
                     </div>
                     <div className="flex gap-2 z-10 shrink-0">
                        <Button
                           variant={student.status === "PRESENT" ? "default" : "outline"}
                           size="sm"
                           onClick={() => markIndividual(student.studentId, "PRESENT")}
                           className={cn(
                              "w-24 gap-1.5 transition-all",
                              student.status === "PRESENT" 
                              ? "bg-green-500 hover:bg-green-600 shadow-green-500/20 shadow-lg border-transparent" 
                              : "hover:border-green-500/50 hover:bg-green-500/10 hover:text-green-500"
                           )}
                        >
                           <CheckCircle2 className="w-4 h-4" /> Present
                        </Button>
                        <Button
                           variant={student.status === "ABSENT" ? "default" : "outline"}
                           size="sm"
                           onClick={() => markIndividual(student.studentId, "ABSENT")}
                           className={cn(
                              "w-24 gap-1.5 transition-all",
                              student.status === "ABSENT" 
                              ? "bg-red-500 hover:bg-red-600 shadow-red-500/20 shadow-lg border-transparent" 
                              : "hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500"
                           )}
                        >
                           <XCircle className="w-4 h-4" /> Absent
                        </Button>
                         <Button
                           variant={student.status === "LATE" ? "default" : "outline"}
                           size="sm"
                           onClick={() => markIndividual(student.studentId, "LATE")}
                           className={cn(
                              "w-20 gap-1.5 transition-all text-xs",
                              student.status === "LATE" 
                              ? "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/20 shadow-lg border-transparent text-white" 
                              : "hover:border-yellow-500/50 hover:bg-yellow-500/10 hover:text-yellow-600"
                           )}
                        >
                           <Clock className="w-3.5 h-3.5" /> Late
                        </Button>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
