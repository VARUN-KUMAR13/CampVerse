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
    DialogTrigger,
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
    RefreshCw,
    Loader2,
    Search,
    Plus,
    Trash2,
    Edit,
    Save,
    BookOpen,
    GraduationCap,
} from "lucide-react";

// Schedule slot interface
interface ScheduleSlot {
    id: string;
    slotNumber: number;
    subjectCode: string;
    subjectName: string;
    startTime: string;
    endTime: string;
    faculty?: string;
    room?: string;
}

// Day schedule interface
interface DaySchedule {
    day: string;
    slots: ScheduleSlot[];
}

// Section schedule interface
interface SectionSchedule {
    id: string;
    year: string;
    branch: string;
    section: string;
    semester: string;
    schedule: DaySchedule[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DEFAULT_SLOTS: Omit<ScheduleSlot, 'id'>[] = [
    { slotNumber: 1, subjectCode: "", subjectName: "", startTime: "09:00", endTime: "12:10", faculty: "", room: "" },
    { slotNumber: 2, subjectCode: "", subjectName: "", startTime: "12:10", endTime: "13:10", faculty: "", room: "" },
    { slotNumber: 3, subjectCode: "", subjectName: "", startTime: "13:55", endTime: "14:55", faculty: "", room: "" },
    { slotNumber: 4, subjectCode: "", subjectName: "", startTime: "14:55", endTime: "15:55", faculty: "", room: "" },
];

const AdminScheduler = () => {
    const { userData } = useAuth();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Current schedules
    const [schedules, setSchedules] = useState<SectionSchedule[]>([]);

    // Form state for new/edit schedule
    const [scheduleForm, setScheduleForm] = useState({
        year: "22",
        branch: "05",
        section: "B",
        semester: "VI",
    });

    // Current day schedule being edited
    const [currentDaySchedule, setCurrentDaySchedule] = useState<DaySchedule[]>([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<string>("Monday");

    // Load schedules from localStorage (in production, this would be Firebase/MongoDB)
    useEffect(() => {
        loadSchedules();
    }, []);

    const loadSchedules = () => {
        setLoading(true);
        try {
            const saved = localStorage.getItem("campverse_schedules");
            if (saved) {
                setSchedules(JSON.parse(saved));
            } else {
                // Initialize with default schedule for CSE-B
                const defaultSchedule = createDefaultSchedule();
                setSchedules([defaultSchedule]);
                localStorage.setItem("campverse_schedules", JSON.stringify([defaultSchedule]));
            }
        } catch (error) {
            console.error("Error loading schedules:", error);
        } finally {
            setLoading(false);
        }
    };

    const createDefaultSchedule = (): SectionSchedule => {
        const defaultDaySchedule: DaySchedule[] = DAYS.map(day => ({
            day,
            slots: [
                { id: `${day}_1`, slotNumber: 1, subjectCode: "22CS401", subjectName: "Linux programming", startTime: "09:00", endTime: "12:10", faculty: "Dr. Smith", room: "Lab 101" },
                { id: `${day}_2`, slotNumber: 2, subjectCode: "22HS301", subjectName: "Business Economics and Financial Analysis", startTime: "12:10", endTime: "13:10", faculty: "Dr. Johnson", room: "Room 201" },
                { id: `${day}_3`, slotNumber: 3, subjectCode: "22HS501", subjectName: "Professional Elective-III", startTime: "13:55", endTime: "14:55", faculty: "Dr. Williams", room: "Room 301" },
                { id: `${day}_4`, slotNumber: 4, subjectCode: "22HS501", subjectName: "Professional Elective-IV", startTime: "14:55", endTime: "15:55", faculty: "Dr. Brown", room: "Room 302" },
            ]
        }));

        return {
            id: "schedule_22_05_B",
            year: "22",
            branch: "05",
            section: "B",
            semester: "VI",
            schedule: defaultDaySchedule,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userData?.collegeId || "admin",
        };
    };

    const saveSchedules = (updatedSchedules: SectionSchedule[]) => {
        localStorage.setItem("campverse_schedules", JSON.stringify(updatedSchedules));
        setSchedules(updatedSchedules);

        // Also save to a global config for student dashboard to read
        const scheduleConfig: Record<string, DaySchedule[]> = {};
        updatedSchedules.forEach(s => {
            const key = `${s.year}_${s.branch}_${s.section}`;
            scheduleConfig[key] = s.schedule;
            console.log("[Scheduler] Saving schedule for key:", key, "with", s.schedule.length, "days");
        });
        localStorage.setItem("campverse_schedule_config", JSON.stringify(scheduleConfig));
        console.log("[Scheduler] ✓ Saved schedule config to localStorage:", Object.keys(scheduleConfig));
    };

    const handleCreateSchedule = () => {
        const scheduleId = `schedule_${scheduleForm.year}_${scheduleForm.branch}_${scheduleForm.section}`;

        // Check if schedule already exists
        if (schedules.find(s => s.id === scheduleId)) {
            toast({
                title: "Schedule Exists",
                description: "A schedule for this section already exists. Please edit it instead.",
                variant: "destructive",
            });
            return;
        }

        const newSchedule: SectionSchedule = {
            id: scheduleId,
            ...scheduleForm,
            schedule: DAYS.map(day => ({
                day,
                slots: DEFAULT_SLOTS.map((slot, idx) => ({
                    ...slot,
                    id: `${day}_${idx + 1}`,
                })),
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userData?.collegeId || "admin",
        };

        const updatedSchedules = [...schedules, newSchedule];
        saveSchedules(updatedSchedules);

        toast({
            title: "Success!",
            description: "Schedule created successfully. Now edit it to add subjects.",
        });

        setIsAddModalOpen(false);

        // Open edit modal for the new schedule
        setSelectedScheduleId(scheduleId);
        setCurrentDaySchedule(newSchedule.schedule);
        setIsEditModalOpen(true);
    };

    const handleEditSchedule = (schedule: SectionSchedule) => {
        setSelectedScheduleId(schedule.id);
        setCurrentDaySchedule(JSON.parse(JSON.stringify(schedule.schedule))); // Deep copy
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

    // Add a new slot to the selected day
    const handleAddSlot = () => {
        setCurrentDaySchedule(prev => prev.map(d => {
            if (d.day === selectedDay) {
                const newSlotNumber = d.slots.length + 1;
                const lastSlot = d.slots[d.slots.length - 1];
                const newSlot: ScheduleSlot = {
                    id: `${d.day}_${newSlotNumber}`,
                    slotNumber: newSlotNumber,
                    subjectCode: "",
                    subjectName: "",
                    startTime: lastSlot ? lastSlot.endTime : "09:00",
                    endTime: lastSlot ? addHourToTime(lastSlot.endTime) : "10:00",
                    faculty: "",
                    room: "",
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

    // Delete a slot from the selected day
    const handleDeleteSlot = (slotIndex: number) => {
        setCurrentDaySchedule(prev => prev.map(d => {
            if (d.day === selectedDay) {
                const updatedSlots = d.slots.filter((_, idx) => idx !== slotIndex);
                // Renumber slots
                return {
                    ...d,
                    slots: updatedSlots.map((slot, idx) => ({
                        ...slot,
                        slotNumber: idx + 1,
                        id: `${d.day}_${idx + 1}`,
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

    // Helper function to add an hour to a time string
    const addHourToTime = (time: string): string => {
        const [hours, minutes] = time.split(':').map(Number);
        const newHours = (hours + 1) % 24;
        return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const handleSaveSchedule = () => {
        if (!selectedScheduleId) return;

        setIsSubmitting(true);
        try {
            const updatedSchedules = schedules.map(s => {
                if (s.id === selectedScheduleId) {
                    return {
                        ...s,
                        schedule: currentDaySchedule,
                        updatedAt: new Date().toISOString(),
                    };
                }
                return s;
            });

            saveSchedules(updatedSchedules);

            toast({
                title: "Schedule Updated!",
                description: "The timetable has been updated. Students will see the changes on their dashboard.",
            });

            setIsEditModalOpen(false);
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
            const updatedSchedules = schedules.filter(s => s.id !== id);
            saveSchedules(updatedSchedules);

            toast({
                title: "Deleted!",
                description: "Schedule has been deleted successfully.",
            });
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

    const filteredSchedules = schedules.filter(schedule => {
        const searchLower = searchTerm.toLowerCase();
        return (
            schedule.section.toLowerCase().includes(searchLower) ||
            getBranchName(schedule.branch).toLowerCase().includes(searchLower) ||
            schedule.year.includes(searchLower)
        );
    });

    const currentDayData = currentDaySchedule.find(d => d.day === selectedDay);

    return (
        <AdminLayout>
            <main className="p-6">
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
                            <Button variant="outline" onClick={loadSchedules} disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                <span className="ml-2">Refresh</span>
                            </Button>
                            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Schedule
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2 text-xl">
                                            <Calendar className="w-6 h-6 text-primary" />
                                            Create New Schedule
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Year</Label>
                                                <Select
                                                    value={scheduleForm.year}
                                                    onValueChange={(value) => setScheduleForm({ ...scheduleForm, year: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="22">2022 Batch</SelectItem>
                                                        <SelectItem value="23">2023 Batch</SelectItem>
                                                        <SelectItem value="24">2024 Batch</SelectItem>
                                                        <SelectItem value="25">2025 Batch</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Branch</Label>
                                                <Select
                                                    value={scheduleForm.branch}
                                                    onValueChange={(value) => setScheduleForm({ ...scheduleForm, branch: value })}
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
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Section</Label>
                                                <Select
                                                    value={scheduleForm.section}
                                                    onValueChange={(value) => setScheduleForm({ ...scheduleForm, section: value })}
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
                                            <div className="space-y-2">
                                                <Label>Semester</Label>
                                                <Select
                                                    value={scheduleForm.semester}
                                                    onValueChange={(value) => setScheduleForm({ ...scheduleForm, semester: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="I">Semester I</SelectItem>
                                                        <SelectItem value="II">Semester II</SelectItem>
                                                        <SelectItem value="III">Semester III</SelectItem>
                                                        <SelectItem value="IV">Semester IV</SelectItem>
                                                        <SelectItem value="V">Semester V</SelectItem>
                                                        <SelectItem value="VI">Semester VI</SelectItem>
                                                        <SelectItem value="VII">Semester VII</SelectItem>
                                                        <SelectItem value="VIII">Semester VIII</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3 pt-4 border-t">
                                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleCreateSchedule}>
                                                Create & Edit
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
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
                                    <p className="text-sm text-muted-foreground">Sections Covered</p>
                                    <p className="text-2xl font-bold">{new Set(schedules.map(s => s.section)).size}</p>
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
                                    <p className="text-2xl font-bold">4</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search schedules by section, branch..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
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
                    {!loading && filteredSchedules.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-foreground mb-2">No schedules found</h3>
                                <p className="text-muted-foreground">
                                    {schedules.length === 0
                                        ? "No schedules created yet. Click 'Create Schedule' to add one."
                                        : "Try adjusting your search."}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredSchedules.map((schedule) => (
                                <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-start gap-3 flex-wrap">
                                                    <h3 className="text-lg font-bold text-foreground">
                                                        {getBranchName(schedule.branch)} - Section {schedule.section}
                                                    </h3>
                                                    <Badge className="bg-blue-500">20{schedule.year} Batch</Badge>
                                                    <Badge variant="secondary">Semester {schedule.semester}</Badge>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {schedule.schedule[0]?.slots.length || 0} slots/day
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        6 days/week
                                                    </span>
                                                    <span className="text-xs">
                                                        Updated: {new Date(schedule.updatedAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                {/* Preview of today's schedule */}
                                                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                                    <p className="text-xs text-muted-foreground mb-2">Today's Preview (Monday):</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {schedule.schedule.find(d => d.day === "Monday")?.slots.slice(0, 3).map((slot, idx) => (
                                                            <Badge key={idx} variant="outline" className="text-xs">
                                                                {slot.subjectName || "Empty Slot"}
                                                            </Badge>
                                                        ))}
                                                        {schedule.schedule.find(d => d.day === "Monday")?.slots.length > 3 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{schedule.schedule.find(d => d.day === "Monday")!.slots.length - 3} more
                                                            </Badge>
                                                        )}
                                                    </div>
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
                                                            disabled={deletingId === schedule.id}
                                                        >
                                                            {deletingId === schedule.id ? (
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
                                                                Are you sure you want to delete the schedule for {getBranchName(schedule.branch)} Section {schedule.section}? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteSchedule(schedule.id)}
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

                    {/* Edit Schedule Modal */}
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
                                                <TableHead className="min-w-[180px]">Faculty</TableHead>
                                                <TableHead className="min-w-[120px]">Room</TableHead>
                                                <TableHead className="w-14">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentDayData.slots.map((slot, idx) => (
                                                <TableRow key={slot.id}>
                                                    <TableCell className="font-medium">{slot.slotNumber}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={slot.subjectCode}
                                                            onChange={(e) => handleSlotChange(selectedDay, idx, "subjectCode", e.target.value)}
                                                            placeholder="22CS401"
                                                            className="h-9 min-w-[120px]"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={slot.subjectName}
                                                            onChange={(e) => handleSlotChange(selectedDay, idx, "subjectName", e.target.value)}
                                                            placeholder="Linux Programming"
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
                                                    <TableCell>
                                                        <Input
                                                            value={slot.faculty || ""}
                                                            onChange={(e) => handleSlotChange(selectedDay, idx, "faculty", e.target.value)}
                                                            placeholder="Dr. Smith"
                                                            className="h-9 min-w-[160px]"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={slot.room || ""}
                                                            onChange={(e) => handleSlotChange(selectedDay, idx, "room", e.target.value)}
                                                            placeholder="Lab 101"
                                                            className="h-9 min-w-[100px]"
                                                        />
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
            </main>
        </AdminLayout>
    );
};

export default AdminScheduler;
