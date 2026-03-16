import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
    Calendar,
    Clock,
    Loader2,
    Plus,
    Trash2,
    Edit,
    Save,
    BookOpen,
    GraduationCap,
    Users,
} from "lucide-react";
import { api } from "@/lib/api";

// ─── Interfaces ───────────────────────────────
interface ScheduleSlot {
    _id?: string;
    slotNumber: number;
    subjectCode: string;
    subjectName: string;
    startTime: string;
    endTime: string;
    faculty?: string;
    room?: string;
    classType?: string;
    className?: string;
    section?: string;
}

interface DaySchedule {
    day: string;
    slots: ScheduleSlot[];
}

interface ScheduleDoc {
    _id: string;
    scheduleType: "student" | "faculty";
    // Student fields
    year?: string;
    branch?: string;
    section?: string;
    semester?: string;
    degree?: string;
    // Faculty fields
    department?: string;
    rollNumber?: string;
    // Common
    schedule: DaySchedule[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

// ─── Constants ────────────────────────────────
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DEFAULT_SLOTS: Omit<ScheduleSlot, '_id'>[] = [];

const DEPARTMENTS = ["CSE", "ECE", "EEE", "Civil", "Mech", "IT", "AIDS", "AIML"];

const AdminScheduler = () => {
    const { userData } = useAuth();
    const { toast } = useToast();

    // ─── Core State ──────────────────────────
    const [loading, setLoading] = useState(false);
    const [schedules, setSchedules] = useState<ScheduleDoc[]>([]);

    // Toggle: "student" or "faculty"
    const [activeTab, setActiveTab] = useState<"student" | "faculty">("student");

    // ─── Filter State ────────────────────────
    // Student filters
    const [filterDegree, setFilterDegree] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const [filterBranch, setFilterBranch] = useState("");
    const [filterSemester, setFilterSemester] = useState("");
    // Faculty filters
    const [filterDepartment, setFilterDepartment] = useState("");
    const [filterRollNumber, setFilterRollNumber] = useState("");

    // ─── Create Schedule Modal ───────────────
    const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [createType, setCreateType] = useState<"student" | "faculty">("student");

    // Student form
    const [studentForm, setStudentForm] = useState({
        year: "22",
        branch: "05",
        section: "B",
        semester: "VI",
        degree: "Major",
    });

    // Faculty form
    const [facultyForm, setFacultyForm] = useState({
        department: "CSE",
        rollNumber: "",
    });

    // ─── Edit Modal ──────────────────────────
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
    const [currentDaySchedule, setCurrentDaySchedule] = useState<DaySchedule[]>([]);
    const [selectedDay, setSelectedDay] = useState<string>("Monday");

    // ─── Load schedules from MongoDB ─────────
    useEffect(() => {
        loadSchedules();
    }, [activeTab, filterDegree, filterYear, filterBranch, filterSemester, filterDepartment, filterRollNumber]);

    const loadSchedules = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("scheduleType", activeTab);

            if (activeTab === "student") {
                if (filterDegree && filterDegree !== "all") params.set("degree", filterDegree);
                if (filterYear && filterYear !== "all") params.set("year", filterYear);
                if (filterBranch && filterBranch !== "all") params.set("branch", filterBranch);
                if (filterSemester && filterSemester !== "all") params.set("semester", filterSemester);
            } else {
                if (filterDepartment && filterDepartment !== "all") params.set("department", filterDepartment);
                if (filterRollNumber) params.set("rollNumber", filterRollNumber);
            }

            const data = await api.get(`/schedules?${params.toString()}`);
            setSchedules(data);
        } catch (error: any) {
            console.error("Error loading schedules:", error);
            // If API fails, try localStorage fallback for student schedules
            if (activeTab === "student") {
                try {
                    const saved = localStorage.getItem("campverse_schedules");
                    if (saved) {
                        const localSchedules = JSON.parse(saved);
                        // Convert to ScheduleDoc format
                        const converted: ScheduleDoc[] = localSchedules.map((s: any) => ({
                            _id: s.id || s._id,
                            scheduleType: "student" as const,
                            year: s.year,
                            branch: s.branch,
                            section: s.section,
                            semester: s.semester,
                            degree: s.degree || "Major",
                            schedule: s.schedule,
                            createdAt: s.createdAt,
                            updatedAt: s.updatedAt,
                            createdBy: s.createdBy,
                        }));
                        setSchedules(converted);
                    }
                } catch (e) {
                    console.error("Error loading from localStorage:", e);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    // ─── Create Schedule Flow ────────────────
    const handleOpenCreateModal = () => {
        setIsCreateTypeModalOpen(true);
    };

    const handleSelectCreateType = (type: "student" | "faculty") => {
        setCreateType(type);
        setIsCreateTypeModalOpen(false);
        setIsAddModalOpen(true);
    };

    const handleCreateSchedule = async () => {
        setIsSubmitting(true);
        try {
            const defaultDaySchedule: DaySchedule[] = DAYS.map(day => ({
                day,
                slots: DEFAULT_SLOTS.map((slot, idx) => ({
                    ...slot,
                    slotNumber: idx + 1,
                })),
            }));

            let body: any = {
                scheduleType: createType,
                schedule: defaultDaySchedule,
                createdBy: userData?.collegeId || "admin",
            };

            if (createType === "student") {
                body = {
                    ...body,
                    year: studentForm.year,
                    branch: studentForm.branch,
                    section: studentForm.section,
                    semester: studentForm.semester,
                    degree: studentForm.degree,
                };
            } else {
                if (!facultyForm.rollNumber.trim()) {
                    toast({
                        title: "Roll Number Required",
                        description: "Please enter a faculty roll/ID number.",
                        variant: "destructive",
                    });
                    setIsSubmitting(false);
                    return;
                }
                body = {
                    ...body,
                    department: facultyForm.department,
                    rollNumber: facultyForm.rollNumber.trim(),
                };
            }

            const saved = await api.post("/schedules", body);

            toast({
                title: "Success!",
                description: "Schedule created successfully. Now edit it to add subjects.",
            });

            setIsAddModalOpen(false);

            // Also save to localStorage for backward compatibility (student only)
            if (createType === "student") {
                syncStudentScheduleToLocalStorage([...schedules, saved]);
            }

            // Open edit modal
            setSelectedScheduleId(saved._id);
            setCurrentDaySchedule(saved.schedule);
            setIsEditModalOpen(true);

            // Refresh list
            loadSchedules();
        } catch (error: any) {
            const msg = error.message || "Failed to create schedule.";
            toast({
                title: "Error",
                description: msg.includes("409") ? "A schedule with these parameters already exists." : msg,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Edit Schedule ───────────────────────
    const handleEditSchedule = (schedule: ScheduleDoc) => {
        setSelectedScheduleId(schedule._id);
        setCurrentDaySchedule(JSON.parse(JSON.stringify(schedule.schedule)));
        setSelectedDay("Monday");
        setIsEditModalOpen(true);
    };

    const handleSlotChange = (day: string, slotIndex: number, field: keyof ScheduleSlot, value: string) => {
        setCurrentDaySchedule(prev => prev.map(d => {
            if (d.day === day) {
                const updatedSlots = [...d.slots];
                updatedSlots[slotIndex] = {
                    ...updatedSlots[slotIndex],
                    [field]: value,
                };
                return { ...d, slots: updatedSlots };
            }
            return d;
        }));
    };

    const handleAddSlot = () => {
        setCurrentDaySchedule(prev => prev.map(d => {
            if (d.day === selectedDay) {
                const newSlotNumber = d.slots.length + 1;
                const lastSlot = d.slots[d.slots.length - 1];
                const newSlot: ScheduleSlot = {
                    slotNumber: newSlotNumber,
                    subjectCode: "",
                    subjectName: "",
                    startTime: lastSlot ? lastSlot.endTime : "09:00",
                    endTime: lastSlot ? addHourToTime(lastSlot.endTime) : "10:00",
                    faculty: "",
                    room: "",
                    classType: "Class",
                };
                return { ...d, slots: [...d.slots, newSlot] };
            }
            return d;
        }));

        toast({
            title: "Slot Added",
            description: `Added slot ${(currentDayData?.slots.length || 0) + 1} to ${selectedDay}`,
        });
    };

    const handleDeleteSlot = (slotIndex: number) => {
        setCurrentDaySchedule(prev => prev.map(d => {
            if (d.day === selectedDay) {
                const updatedSlots = d.slots.filter((_, idx) => idx !== slotIndex);
                return {
                    ...d,
                    slots: updatedSlots.map((slot, idx) => ({
                        ...slot,
                        slotNumber: idx + 1,
                    })),
                };
            }
            return d;
        }));

        toast({
            title: "Slot Deleted",
            description: `Removed slot from ${selectedDay}`,
        });
    };

    const addHourToTime = (time: string): string => {
        const [hours, minutes] = time.split(':').map(Number);
        const newHours = (hours + 1) % 24;
        return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const handleSaveSchedule = async () => {
        if (!selectedScheduleId) return;

        setIsSubmitting(true);
        try {
            const cleanedDaySchedule = currentDaySchedule.map(day => {
                const filledSlots = day.slots.filter(slot => 
                    (slot.subjectName?.trim() || slot.subjectCode?.trim() || slot.faculty?.trim() || slot.room?.trim())
                );
                return {
                    ...day,
                    slots: filledSlots.map((slot, idx) => ({ ...slot, slotNumber: idx + 1 }))
                };
            });

            const updated = await api.put(`/schedules/${selectedScheduleId}`, {
                schedule: cleanedDaySchedule,
            });

            toast({
                title: "Schedule Updated!",
                description: "The timetable has been updated. Changes will reflect on dashboards.",
            });

            // Also update localStorage for student schedules (backward compat)
            const targetSchedule = schedules.find(s => s._id === selectedScheduleId);
            if (targetSchedule?.scheduleType === "student") {
                const updatedSchedules = schedules.map(s => {
                    if (s._id === selectedScheduleId) {
                        return { ...s, schedule: cleanedDaySchedule, updatedAt: new Date().toISOString() };
                    }
                    return s;
                });
                syncStudentScheduleToLocalStorage(updatedSchedules);
            }

            setIsEditModalOpen(false);
            loadSchedules();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to save schedule.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        setDeletingId(id);
        try {
            await api.delete(`/schedules/${id}`);

            toast({
                title: "Deleted!",
                description: "Schedule has been deleted successfully.",
            });

            // Remove from localStorage too
            const remaining = schedules.filter(s => s._id !== id);
            syncStudentScheduleToLocalStorage(remaining.filter(s => s.scheduleType === "student"));

            loadSchedules();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete schedule.",
                variant: "destructive",
            });
        } finally {
            setDeletingId(null);
        }
    };

    // ─── Helpers ─────────────────────────────
    const syncStudentScheduleToLocalStorage = (studentSchedules: ScheduleDoc[]) => {
        try {
            // Save in old format for student dashboard backward compat
            const scheduleConfig: Record<string, DaySchedule[]> = {};
            studentSchedules.forEach(s => {
                if (s.scheduleType === "student" && s.year && s.branch && s.section) {
                    const key = `${s.year}_${s.branch}_${s.section}`;
                    scheduleConfig[key] = s.schedule;
                }
            });
            localStorage.setItem("campverse_schedule_config", JSON.stringify(scheduleConfig));
        } catch (e) {
            console.error("Error syncing to localStorage:", e);
        }
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getBranchName = (code: string) => {
        const branches: Record<string, string> = {
            "05": "CSE",
            "04": "ECE",
            "02": "EEE",
            "01": "Civil",
            "03": "Mech",
        };
        return branches[code] || code;
    };

    const getYearLabel = (code: string) => {
        const years: Record<string, string> = {
            "22": "I Year", "23": "II Year", "24": "III Year", "25": "IV Year",
        };
        return years[code] || `20${code} Batch`;
    };

    const currentDayData = currentDaySchedule.find(d => d.day === selectedDay);

    // ─── Stats ───────────────────────────────
    const studentSchedules = schedules.filter(s => s.scheduleType === "student");
    const facultySchedules = schedules.filter(s => s.scheduleType === "faculty");
    const displayedSchedules = activeTab === "student" ? studentSchedules : facultySchedules;

    // Determine the type of schedule being edited
    const editingScheduleType = schedules.find(s => s._id === selectedScheduleId)?.scheduleType || createType;

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <Calendar className="w-8 h-8 text-primary" />
                            Schedule Management
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage class timetables for all sections
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleOpenCreateModal}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Schedule
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Schedules</p>
                                <p className="text-2xl font-bold">{schedules.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {activeTab === "student" ? "Sections Covered" : "Faculty Covered"}
                                </p>
                                <p className="text-2xl font-bold">
                                    {activeTab === "student"
                                        ? new Set(studentSchedules.map(s => s.section)).size
                                        : facultySchedules.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Daily Slots</p>
                                <p className="text-2xl font-bold">
                                    {displayedSchedules[0]?.schedule?.[0]?.slots?.length || 4}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ─── Toggle Switch: Student | Faculty ─── */}
                <div className="flex justify-start">
                    <div className="inline-flex rounded-full p-1 bg-muted/60 border border-border">
                        <button
                            onClick={() => setActiveTab("student")}
                            className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${activeTab === "student"
                                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Student
                        </button>
                        <button
                            onClick={() => setActiveTab("faculty")}
                            className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${activeTab === "faculty"
                                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Faculty
                        </button>
                    </div>
                </div>

                {/* ─── Filter Dropdowns ─── */}
                <Card>
                    <CardContent className="p-4">
                        {activeTab === "student" ? (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Degree</Label>
                                    <Select value={filterDegree} onValueChange={setFilterDegree}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Degrees" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Degrees</SelectItem>
                                            <SelectItem value="Major">Major</SelectItem>
                                            <SelectItem value="Minor">Minor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Year</Label>
                                    <Select value={filterYear} onValueChange={setFilterYear}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Years" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Years</SelectItem>
                                            <SelectItem value="22">I Year</SelectItem>
                                            <SelectItem value="23">II Year</SelectItem>
                                            <SelectItem value="24">III Year</SelectItem>
                                            <SelectItem value="25">IV Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Semester</Label>
                                    <Select value={filterSemester} onValueChange={setFilterSemester}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Semesters" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Semesters</SelectItem>
                                            <SelectItem value="I">Semester I</SelectItem>
                                            <SelectItem value="II">Semester II</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Branch</Label>
                                    <Select value={filterBranch} onValueChange={setFilterBranch}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Branches" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Branches</SelectItem>
                                            <SelectItem value="05">CSE</SelectItem>
                                            <SelectItem value="04">ECE</SelectItem>
                                            <SelectItem value="02">EEE</SelectItem>
                                            <SelectItem value="01">Civil</SelectItem>
                                            <SelectItem value="03">Mech</SelectItem>
                                            <SelectItem value="06">IT</SelectItem>
                                            <SelectItem value="07">AIDS</SelectItem>
                                            <SelectItem value="08">AIML</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Department</Label>
                                    <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Departments" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Departments</SelectItem>
                                            {DEPARTMENTS.map(dept => (
                                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Roll Number (Optional)</Label>
                                    <Input
                                        placeholder="Enter faculty roll number..."
                                        value={filterRollNumber}
                                        onChange={(e) => setFilterRollNumber(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Loading */}
                {loading && schedules.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                            <p className="text-muted-foreground">Loading schedules...</p>
                        </CardContent>
                    </Card>
                )}

                {/* Schedules List */}
                {!loading && displayedSchedules.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">No schedules found</h3>
                            <p className="text-muted-foreground">
                                No {activeTab} schedules created yet. Click "Create Schedule" to add one.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {displayedSchedules.map((schedule) => (
                            <Card key={schedule._id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-start gap-3 flex-wrap">
                                                {schedule.scheduleType === "student" ? (
                                                    <>
                                                        <h3 className="text-lg font-bold text-foreground">
                                                            {getBranchName(schedule.branch || "")} - Section {schedule.section}
                                                        </h3>
                                                        <Badge className="bg-blue-500">20{schedule.year} Batch</Badge>
                                                        <Badge variant="secondary">Semester {schedule.semester}</Badge>
                                                        {schedule.degree && (
                                                            <Badge variant="outline">{schedule.degree}</Badge>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                                            <Users className="w-5 h-5 text-purple-500" />
                                                            {schedule.department} - {schedule.rollNumber}
                                                        </h3>
                                                        <Badge className="bg-purple-500">Faculty</Badge>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                <span className="text-xs">
                                                    Updated: {new Date(schedule.updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditSchedule(schedule)}
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        disabled={deletingId === schedule._id}
                                                    >
                                                        {deletingId === schedule._id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Schedule?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete this schedule? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteSchedule(schedule._id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* ─── Create Type Selection Modal ─── */}
                <Dialog open={isCreateTypeModalOpen} onOpenChange={setIsCreateTypeModalOpen}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <Calendar className="w-6 h-6 text-primary" />
                                Create Schedule For
                            </DialogTitle>
                        </DialogHeader>
                        <div className="flex gap-4 py-6">
                            <Button
                                className="flex-1 h-24 flex-col gap-2"
                                variant="outline"
                                onClick={() => handleSelectCreateType("student")}
                            >
                                <GraduationCap className="w-8 h-8 text-blue-500" />
                                <span className="text-sm font-semibold">Student</span>
                            </Button>
                            <Button
                                className="flex-1 h-24 flex-col gap-2"
                                variant="outline"
                                onClick={() => handleSelectCreateType("faculty")}
                            >
                                <Users className="w-8 h-8 text-purple-500" />
                                <span className="text-sm font-semibold">Faculty</span>
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ─── Create Schedule Form Modal ─── */}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                {createType === "student" ? (
                                    <GraduationCap className="w-6 h-6 text-blue-500" />
                                ) : (
                                    <Users className="w-6 h-6 text-purple-500" />
                                )}
                                Create {createType === "student" ? "Student" : "Faculty"} Schedule
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {createType === "student" ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Degree</Label>
                                            <Select
                                                value={studentForm.degree}
                                                onValueChange={(value) => setStudentForm({ ...studentForm, degree: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Major">Major</SelectItem>
                                                    <SelectItem value="Minor">Minor</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Year</Label>
                                            <Select
                                                value={studentForm.year}
                                                onValueChange={(value) => setStudentForm({ ...studentForm, year: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="22">I Year</SelectItem>
                                                    <SelectItem value="23">II Year</SelectItem>
                                                    <SelectItem value="24">III Year</SelectItem>
                                                    <SelectItem value="25">IV Year</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Branch</Label>
                                            <Select
                                                value={studentForm.branch}
                                                onValueChange={(value) => setStudentForm({ ...studentForm, branch: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="05">CSE</SelectItem>
                                                    <SelectItem value="04">ECE</SelectItem>
                                                    <SelectItem value="02">EEE</SelectItem>
                                                    <SelectItem value="01">Civil</SelectItem>
                                                    <SelectItem value="03">Mech</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Section</Label>
                                            <Select
                                                value={studentForm.section}
                                                onValueChange={(value) => setStudentForm({ ...studentForm, section: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="A">Section A</SelectItem>
                                                    <SelectItem value="B">Section B</SelectItem>
                                                    <SelectItem value="C">Section C</SelectItem>
                                                    <SelectItem value="D">Section D</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Semester</Label>
                                        <Select
                                            value={studentForm.semester}
                                            onValueChange={(value) => setStudentForm({ ...studentForm, semester: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="I">Semester I</SelectItem>
                                                <SelectItem value="II">Semester II</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label>Department</Label>
                                        <Select
                                            value={facultyForm.department}
                                            onValueChange={(value) => setFacultyForm({ ...facultyForm, department: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DEPARTMENTS.map(dept => (
                                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Roll Number / Faculty ID</Label>
                                        <Input
                                            placeholder="Enter faculty roll number..."
                                            value={facultyForm.rollNumber}
                                            onChange={(e) => setFacultyForm({ ...facultyForm, rollNumber: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateSchedule} disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create & Edit"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ─── Edit Schedule Modal ─── */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <Calendar className="w-6 h-6 text-primary" />
                                Edit Schedule
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {/* Day Selector */}
                            <div className="flex gap-2 flex-wrap">
                                {DAYS.map(day => (
                                    <Button
                                        key={day}
                                        variant={selectedDay === day ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedDay(day)}
                                    >
                                        {day}
                                    </Button>
                                ))}
                            </div>

                            {/* Slots Table */}
                            {currentDayData && (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-14">Slot</TableHead>
                                            <TableHead className="min-w-[140px]">Subject Code</TableHead>
                                            <TableHead className="min-w-[280px]">Subject Name</TableHead>
                                            <TableHead className="min-w-[140px]">Start Time</TableHead>
                                            <TableHead className="min-w-[140px]">End Time</TableHead>
                                            {editingScheduleType === "faculty" ? (
                                                <>
                                                    <TableHead className="min-w-[140px]">Class</TableHead>
                                                    <TableHead className="min-w-[120px]">Section</TableHead>
                                                </>
                                            ) : (
                                                <TableHead className="min-w-[180px]">Faculty</TableHead>
                                            )}
                                            <TableHead className="min-w-[120px]">Room</TableHead>
                                            <TableHead className="min-w-[120px]">Class Type</TableHead>
                                            <TableHead className="w-14">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentDayData.slots.map((slot, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{slot.slotNumber}</TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={slot.subjectCode}
                                                        onChange={(e) => handleSlotChange(selectedDay, idx, "subjectCode", e.target.value)}
                                                        placeholder=""
                                                        className="h-9 min-w-[120px]"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={slot.subjectName}
                                                        onChange={(e) => handleSlotChange(selectedDay, idx, "subjectName", e.target.value)}
                                                        placeholder=""
                                                        className="h-9 min-w-[250px]"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="time"
                                                        value={slot.startTime}
                                                        onChange={(e) => handleSlotChange(selectedDay, idx, "startTime", e.target.value)}
                                                        className="h-9 w-32"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="time"
                                                        value={slot.endTime}
                                                        onChange={(e) => handleSlotChange(selectedDay, idx, "endTime", e.target.value)}
                                                        className="h-9 w-32"
                                                    />
                                                </TableCell>
                                                {editingScheduleType === "faculty" ? (
                                                    <>
                                                        <TableCell>
                                                            <Input
                                                                value={slot.className || ""}
                                                                onChange={(e) => handleSlotChange(selectedDay, idx, "className", e.target.value)}
                                                                placeholder=""
                                                                className="h-9 min-w-[120px]"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={slot.section || ""}
                                                                onChange={(e) => handleSlotChange(selectedDay, idx, "section", e.target.value)}
                                                                placeholder=""
                                                                className="h-9 min-w-[80px]"
                                                            />
                                                        </TableCell>
                                                    </>
                                                ) : (
                                                    <TableCell>
                                                        <Input
                                                            value={slot.faculty || ""}
                                                            onChange={(e) => handleSlotChange(selectedDay, idx, "faculty", e.target.value)}
                                                            placeholder=""
                                                            className="h-9 min-w-[160px]"
                                                        />
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    <Input
                                                        value={slot.room || ""}
                                                        onChange={(e) => handleSlotChange(selectedDay, idx, "room", e.target.value)}
                                                        placeholder=""
                                                        className="h-9 min-w-[100px]"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <select
                                                        value={slot.classType || "Class"}
                                                        onChange={(e) => handleSlotChange(selectedDay, idx, "classType", e.target.value)}
                                                        className="h-9 min-w-[100px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                    >
                                                        <option value="Class">Class</option>
                                                        <option value="Lab">Lab</option>
                                                        <option value="Tutorial">Tutorial</option>
                                                    </select>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDeleteSlot(idx)}
                                                        disabled={currentDayData!.slots.length <= 1}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            {/* Add Slot Button */}
                            <div className="flex justify-center">
                                <Button
                                    variant="outline"
                                    onClick={handleAddSlot}
                                    className="border-dashed"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Slot
                                </Button>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveSchedule} disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Schedule
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminScheduler;
