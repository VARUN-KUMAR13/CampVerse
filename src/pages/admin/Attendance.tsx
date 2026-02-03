import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AdminLayout from "@/components/AdminLayout";
import {
    CheckCircle2,
    XCircle,
    Clock,
    Shield,
    Users,
    Calendar,
    Search,
    Filter,
    Download,
    Upload,
    RefreshCw,
    AlertTriangle,
    FileText,
    Building2,
    Trophy,
    Briefcase,
    Sparkles,
    TrendingUp,
    BarChart3,
    UserCheck,
    UserX,
    Pencil,
    Trash2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    AttendanceRecord,
    AttendanceStatus,
    AttendanceCategory,
    AttendanceStudent,
    TimeSlot,
    StudentAttendanceSummary,
    ATTENDANCE_THRESHOLDS,
} from "@/types/attendance";
import {
    getServerTime,
    formatDate,
    formatTime,
    adminOverrideAttendance,
    getStudentsForSection,
    calculateFourWeekAttendance,
} from "@/services/attendanceService";

interface StudentWithSelection extends AttendanceStudent {
    selected: boolean;
    attendancePercentage?: number;
}

const AdminAttendance = () => {
    const { userData } = useAuth();

    // Tab state
    const [activeTab, setActiveTab] = useState("override");

    // Filter state
    const [selectedYear, setSelectedYear] = useState("22");
    const [selectedBranch, setSelectedBranch] = useState("05");
    const [selectedSection, setSelectedSection] = useState("B");
    const [selectedCategory, setSelectedCategory] = useState<AttendanceCategory>("ACADEMIC");
    const [searchQuery, setSearchQuery] = useState("");

    // Student selection state
    const [students, setStudents] = useState<StudentWithSelection[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    // Override form state
    const [overrideSlot, setOverrideSlot] = useState("");
    const [overrideDate, setOverrideDate] = useState(formatDate(new Date()));
    const [overrideStatus, setOverrideStatus] = useState<AttendanceStatus>("PRESENT");
    const [overrideReason, setOverrideReason] = useState("");

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [serverTime, setServerTime] = useState<Date>(new Date());

    // Statistics
    const [stats, setStats] = useState({
        totalStudents: 0,
        averageAttendance: 0,
        belowThreshold: 0,
        perfectAttendance: 0,
    });

    // Available slots
    const availableSlots: TimeSlot[] = [
        { id: "slot_1", slotNumber: 1, startTime: "09:00", endTime: "10:00", subjectCode: "CS101", subjectName: "Linux Programming", facultyId: "", section: "A", branch: "05", year: "22" },
        { id: "slot_2", slotNumber: 2, startTime: "10:00", endTime: "11:00", subjectCode: "CS102", subjectName: "Business Economics", facultyId: "", section: "A", branch: "05", year: "22" },
        { id: "slot_3", slotNumber: 3, startTime: "11:15", endTime: "12:15", subjectCode: "CS103", subjectName: "Professional Elective III", facultyId: "", section: "A", branch: "05", year: "22" },
        { id: "slot_4", slotNumber: 4, startTime: "14:00", endTime: "15:00", subjectCode: "CS104", subjectName: "Professional Elective IV", facultyId: "", section: "A", branch: "05", year: "22" },
    ];

    // Override reasons presets
    const reasonPresets = [
        { label: "Placement Drive", value: "Student attending placement drive/interview" },
        { label: "CDC Drive", value: "Student participating in CDC activities" },
        { label: "Technical Event", value: "Student participating in technical event" },
        { label: "Sports Event", value: "Student representing in sports competition" },
        { label: "Medical Emergency", value: "Medical emergency - verified" },
        { label: "Other", value: "" },
    ];

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

    // Load students when filters change
    useEffect(() => {
        loadStudents();
    }, [selectedYear, selectedBranch, selectedSection]);

    const loadStudents = async () => {
        setIsLoading(true);
        try {
            // Fetch students from Firebase using the centralized service
            const firebaseStudents = await getStudentsForSection(selectedYear, selectedBranch, selectedSection);

            if (firebaseStudents.length > 0) {
                // Transform to StudentWithSelection format with mock attendance percentages
                const studentStates: StudentWithSelection[] = firebaseStudents.map((student, index) => ({
                    rollNumber: student.rollNumber,
                    name: student.name,
                    section: selectedSection,
                    branch: selectedBranch,
                    year: selectedYear,
                    selected: false,
                    attendancePercentage: 70 + Math.floor(Math.random() * 30), // Mock percentage
                }));

                setStudents(studentStates);
                console.log(`Loaded ${studentStates.length} students from Firebase for Section ${selectedSection}`);

                // Calculate stats
                const total = studentStates.length;
                const avgAttendance = studentStates.reduce((sum, s) => sum + (s.attendancePercentage || 0), 0) / total;
                const belowThreshold = studentStates.filter(s => (s.attendancePercentage || 0) < ATTENDANCE_THRESHOLDS.SATISFACTORY).length;
                const perfect = studentStates.filter(s => (s.attendancePercentage || 0) === 100).length;

                setStats({
                    totalStudents: total,
                    averageAttendance: Math.round(avgAttendance),
                    belowThreshold,
                    perfectAttendance: perfect,
                });
            } else {
                // No students found
                setStudents([]);
                toast.info(`No students found for Section ${selectedSection}. Check Firebase database.`);
                setStats({ totalStudents: 0, averageAttendance: 0, belowThreshold: 0, perfectAttendance: 0 });
            }
        } catch (error) {
            console.error("Error loading students:", error);
            toast.error("Failed to load students from Firebase");
            setStudents([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        setStudents(prev => prev.map(s => ({ ...s, selected: checked })));
    };

    const handleSelectStudent = (rollNumber: string, checked: boolean) => {
        setStudents(prev => prev.map(s =>
            s.rollNumber === rollNumber ? { ...s, selected: checked } : s
        ));

        // Update selectAll state
        const updatedStudents = students.map(s =>
            s.rollNumber === rollNumber ? { ...s, selected: checked } : s
        );
        setSelectAll(updatedStudents.every(s => s.selected));
    };

    const handleReasonPreset = (preset: string) => {
        if (preset) {
            setOverrideReason(preset);
        }
    };

    const getSelectedStudents = () => students.filter(s => s.selected);

    const filteredStudents = students.filter(s =>
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmitOverride = async () => {
        if (!overrideSlot) {
            toast.error("Please select a slot");
            return;
        }
        if (!overrideReason.trim()) {
            toast.error("Please provide a reason for override");
            return;
        }

        const selectedStudentIds = getSelectedStudents().map(s => s.rollNumber);
        if (selectedStudentIds.length === 0) {
            toast.error("Please select at least one student");
            return;
        }

        setShowConfirmDialog(true);
    };

    const confirmOverride = async () => {
        setIsSubmitting(true);
        try {
            const selectedStudentIds = getSelectedStudents().map(s => s.rollNumber);

            const result = await adminOverrideAttendance(
                selectedStudentIds,
                overrideSlot,
                overrideDate,
                overrideStatus,
                overrideReason,
                userData?.collegeId || "admin",
                availableSlots.find(s => s.id === overrideSlot)?.subjectCode || "OVERRIDE",
                availableSlots.find(s => s.id === overrideSlot)?.subjectName || "Admin Override",
                selectedSection,
                selectedBranch,
                selectedYear
            );

            if (result.success) {
                toast.success(`Successfully marked attendance for ${result.markedCount} students`);

                // Reset form
                setStudents(prev => prev.map(s => ({ ...s, selected: false })));
                setSelectAll(false);
                setOverrideReason("");
                setOverrideSlot("");
            } else {
                toast.error(`Failed to mark ${result.failedCount} students`);
            }
        } catch (error) {
            console.error("Error submitting override:", error);
            toast.error("Failed to submit attendance override");
        } finally {
            setIsSubmitting(false);
            setShowConfirmDialog(false);
        }
    };

    const getAttendanceStatusColor = (percentage: number) => {
        if (percentage >= ATTENDANCE_THRESHOLDS.SATISFACTORY) return "text-green-500";
        if (percentage >= ATTENDANCE_THRESHOLDS.WARNING) return "text-yellow-500";
        return "text-red-500";
    };

    const getAttendanceStatusBadge = (percentage: number) => {
        if (percentage >= ATTENDANCE_THRESHOLDS.SATISFACTORY) {
            return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Good</Badge>;
        }
        if (percentage >= ATTENDANCE_THRESHOLDS.WARNING) {
            return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Warning</Badge>;
        }
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Critical</Badge>;
    };

    return (
        <AdminLayout>
            <main className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Shield className="w-6 h-6 text-primary" />
                            Attendance Management
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Override attendance, track statistics, and manage exceptions
                        </p>
                    </div>
                    <Badge variant="outline" className="text-sm py-1.5 px-3">
                        Server Time: {serverTime.toLocaleTimeString()}
                    </Badge>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-border/50 bg-gradient-to-br from-blue-500/10 to-transparent">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Students</p>
                                    <p className="text-2xl font-bold text-blue-500">{stats.totalStudents}</p>
                                </div>
                                <Users className="w-8 h-8 text-blue-500/50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-gradient-to-br from-green-500/10 to-transparent">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Average Attendance</p>
                                    <p className="text-2xl font-bold text-green-500">{stats.averageAttendance}%</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-green-500/50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-gradient-to-br from-red-500/10 to-transparent">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Below Threshold</p>
                                    <p className="text-2xl font-bold text-red-500">{stats.belowThreshold}</p>
                                </div>
                                <UserX className="w-8 h-8 text-red-500/50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-gradient-to-br from-purple-500/10 to-transparent">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Perfect Attendance</p>
                                    <p className="text-2xl font-bold text-purple-500">{stats.perfectAttendance}</p>
                                </div>
                                <Trophy className="w-8 h-8 text-purple-500/50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid grid-cols-5 w-full max-w-3xl">
                        <TabsTrigger value="override" className="gap-2">
                            <Shield className="w-4 h-4" />
                            Override
                        </TabsTrigger>
                        <TabsTrigger value="manage" className="gap-2">
                            <UserCheck className="w-4 h-4" />
                            Manage Records
                        </TabsTrigger>
                        <TabsTrigger value="events" className="gap-2">
                            <Sparkles className="w-4 h-4" />
                            Events/Sports
                        </TabsTrigger>
                        <TabsTrigger value="reports" className="gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Reports
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2">
                            <FileText className="w-4 h-4" />
                            Settings
                        </TabsTrigger>
                    </TabsList>

                    {/* Override Attendance Tab */}
                    <TabsContent value="override" className="space-y-6">
                        <Card className="border-border/50 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary" />
                                    Manual Attendance Override
                                </CardTitle>
                                <CardDescription>
                                    Use this for placement drives, CDC activities, or other approved absences.
                                    Select students and provide justification for the override.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Filters */}
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Year</Label>
                                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="22">2022 Batch</SelectItem>
                                                <SelectItem value="23">2023 Batch</SelectItem>
                                                <SelectItem value="24">2024 Batch</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-xs text-muted-foreground">Branch</Label>
                                        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="05">CSE</SelectItem>
                                                <SelectItem value="04">ECE</SelectItem>
                                                <SelectItem value="03">EEE</SelectItem>
                                                <SelectItem value="02">MECH</SelectItem>
                                                <SelectItem value="01">CIVIL</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-xs text-muted-foreground">Section</Label>
                                        <Select value={selectedSection} onValueChange={setSelectedSection}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="B">Section B</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-xs text-muted-foreground">Date</Label>
                                        <Input
                                            type="date"
                                            value={overrideDate}
                                            onChange={(e) => setOverrideDate(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs text-muted-foreground">Slot</Label>
                                        <Select value={overrideSlot} onValueChange={setOverrideSlot}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select slot" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableSlots.map((slot) => (
                                                    <SelectItem key={slot.id} value={slot.id}>
                                                        Slot {slot.slotNumber} - {slot.subjectName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by roll number or name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {/* Student Selection Table */}
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="w-12">
                                                    <Checkbox
                                                        checked={selectAll}
                                                        onCheckedChange={handleSelectAll}
                                                    />
                                                </TableHead>
                                                <TableHead>Roll Number</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead className="text-center">Current Attendance</TableHead>
                                                <TableHead className="text-center">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8">
                                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredStudents.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                        No students found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredStudents.map((student) => (
                                                    <TableRow
                                                        key={student.rollNumber}
                                                        className={cn(
                                                            "transition-colors",
                                                            student.selected && "bg-primary/5"
                                                        )}
                                                    >
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={student.selected}
                                                                onCheckedChange={(checked) =>
                                                                    handleSelectStudent(student.rollNumber, checked as boolean)
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell className="font-medium">{student.rollNumber}</TableCell>
                                                        <TableCell>{student.name}</TableCell>
                                                        <TableCell className="text-center">
                                                            <span className={cn(
                                                                "font-semibold",
                                                                getAttendanceStatusColor(student.attendancePercentage || 0)
                                                            )}>
                                                                {student.attendancePercentage || 0}%
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {getAttendanceStatusBadge(student.attendancePercentage || 0)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Override Form */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Mark As</Label>
                                            <div className="flex gap-4 mt-2">
                                                <Button
                                                    type="button"
                                                    variant={overrideStatus === "PRESENT" ? "default" : "outline"}
                                                    onClick={() => setOverrideStatus("PRESENT")}
                                                    className={cn(
                                                        "flex-1 gap-2",
                                                        overrideStatus === "PRESENT" && "bg-green-600 hover:bg-green-700"
                                                    )}
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Present
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={overrideStatus === "ABSENT" ? "default" : "outline"}
                                                    onClick={() => setOverrideStatus("ABSENT")}
                                                    className={cn(
                                                        "flex-1 gap-2",
                                                        overrideStatus === "ABSENT" && "bg-red-600 hover:bg-red-700"
                                                    )}
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Absent
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={overrideStatus === "EXCUSED" ? "default" : "outline"}
                                                    onClick={() => setOverrideStatus("EXCUSED")}
                                                    className={cn(
                                                        "flex-1 gap-2",
                                                        overrideStatus === "EXCUSED" && "bg-blue-600 hover:bg-blue-700"
                                                    )}
                                                >
                                                    <AlertTriangle className="w-4 h-4" />
                                                    Excused
                                                </Button>
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Quick Reason</Label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {reasonPresets.map((preset) => (
                                                    <Badge
                                                        key={preset.label}
                                                        variant="outline"
                                                        className="cursor-pointer hover:bg-primary/10"
                                                        onClick={() => handleReasonPreset(preset.value)}
                                                    >
                                                        {preset.label}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label>Override Reason *</Label>
                                            <Textarea
                                                placeholder="Provide detailed justification for this attendance override..."
                                                value={overrideReason}
                                                onChange={(e) => setOverrideReason(e.target.value)}
                                                className="mt-2 h-32 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Selection Summary & Submit */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">{getSelectedStudents().length}</span>
                                        {" "}students selected
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setStudents(prev => prev.map(s => ({ ...s, selected: false })));
                                                setSelectAll(false);
                                            }}
                                        >
                                            Clear Selection
                                        </Button>
                                        <Button
                                            onClick={handleSubmitOverride}
                                            disabled={getSelectedStudents().length === 0 || isSubmitting}
                                            className="bg-primary hover:bg-primary/90 gap-2"
                                        >
                                            <Shield className="w-4 h-4" />
                                            Submit Override
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Manage Records Tab */}
                    <TabsContent value="manage" className="space-y-6">
                        <Card className="border-border/50 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-cyan-500" />
                                    Manage Attendance Records
                                </CardTitle>
                                <CardDescription>
                                    View, edit, or delete existing attendance records. Use filters to find specific records.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Filters */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Student ID</Label>
                                        <Input
                                            placeholder="e.g., 22B81A05C3"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Date</Label>
                                        <Input
                                            type="date"
                                            defaultValue={formatDate(new Date())}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Status Filter</Label>
                                        <Select defaultValue="all">
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="PRESENT">Present</SelectItem>
                                                <SelectItem value="ABSENT">Absent</SelectItem>
                                                <SelectItem value="LATE">Late</SelectItem>
                                                <SelectItem value="EXCUSED">Excused</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-end">
                                        <Button className="w-full gap-2">
                                            <Search className="w-4 h-4" />
                                            Search Records
                                        </Button>
                                    </div>
                                </div>

                                {/* Records Table */}
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead>Student ID</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Slot</TableHead>
                                                <TableHead className="text-center">Status</TableHead>
                                                <TableHead className="text-center">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {/* Sample attendance records */}
                                            <TableRow>
                                                <TableCell className="font-medium">22B81A05C3</TableCell>
                                                <TableCell>KATAKAM VARUN KUMAR</TableCell>
                                                <TableCell>{formatDate(new Date())}</TableCell>
                                                <TableCell>Slot 1 - Linux Programming</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Present</Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Button size="sm" variant="outline" className="h-8 gap-1">
                                                            <Pencil className="w-3 h-3" />
                                                            Edit
                                                        </Button>
                                                        <Button size="sm" variant="destructive" className="h-8 gap-1">
                                                            <Trash2 className="w-3 h-3" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">22B81A05C1</TableCell>
                                                <TableCell>Student One</TableCell>
                                                <TableCell>{formatDate(new Date())}</TableCell>
                                                <TableCell>Slot 1 - Linux Programming</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Absent</Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Button size="sm" variant="outline" className="h-8 gap-1">
                                                            <Pencil className="w-3 h-3" />
                                                            Edit
                                                        </Button>
                                                        <Button size="sm" variant="destructive" className="h-8 gap-1">
                                                            <Trash2 className="w-3 h-3" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-medium">22B81A05C2</TableCell>
                                                <TableCell>Student Two</TableCell>
                                                <TableCell>{formatDate(new Date())}</TableCell>
                                                <TableCell>Slot 2 - Business Economics</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Present</Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Button size="sm" variant="outline" className="h-8 gap-1">
                                                            <Pencil className="w-3 h-3" />
                                                            Edit
                                                        </Button>
                                                        <Button size="sm" variant="destructive" className="h-8 gap-1">
                                                            <Trash2 className="w-3 h-3" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Bulk Actions */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        Showing 3 attendance records
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" className="gap-2">
                                            <Download className="w-4 h-4" />
                                            Export Records
                                        </Button>
                                        <Button variant="destructive" className="gap-2">
                                            <XCircle className="w-4 h-4" />
                                            Delete Selected
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Events/Sports Tab */}
                    <TabsContent value="events" className="space-y-6">
                        <Card className="border-border/50 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-500" />
                                    Event & Activities Attendance
                                </CardTitle>
                                <CardDescription>
                                    Mark attendance for events, sports competitions, and club activities.
                                    This attendance is tracked separately from academic attendance.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Event Card */}
                                    <Card className="border-purple-500/30 bg-purple-500/5">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                                    <Sparkles className="w-5 h-5 text-purple-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">Events</h3>
                                                    <p className="text-xs text-muted-foreground">Technical & Cultural</p>
                                                </div>
                                            </div>
                                            <Button className="w-full" variant="outline">
                                                Manage Event Attendance
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Sports Card */}
                                    <Card className="border-green-500/30 bg-green-500/5">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                                    <Trophy className="w-5 h-5 text-green-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">Sports</h3>
                                                    <p className="text-xs text-muted-foreground">Competitions & Practice</p>
                                                </div>
                                            </div>
                                            <Button className="w-full" variant="outline">
                                                Manage Sports Attendance
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Clubs Card */}
                                    <Card className="border-blue-500/30 bg-blue-500/5">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">Clubs</h3>
                                                    <p className="text-xs text-muted-foreground">Club Meetings & Activities</p>
                                                </div>
                                            </div>
                                            <Button className="w-full" variant="outline">
                                                Manage Club Attendance
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reports Tab */}
                    <TabsContent value="reports" className="space-y-6">
                        <Card className="border-border/50 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-blue-500" />
                                    Attendance Reports
                                </CardTitle>
                                <CardDescription>
                                    Generate and download attendance reports for analysis.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Button variant="outline" className="h-auto p-4 justify-start gap-3">
                                        <Download className="w-5 h-5" />
                                        <div className="text-left">
                                            <div className="font-medium">Weekly Report</div>
                                            <div className="text-xs text-muted-foreground">Last 7 days attendance summary</div>
                                        </div>
                                    </Button>
                                    <Button variant="outline" className="h-auto p-4 justify-start gap-3">
                                        <Download className="w-5 h-5" />
                                        <div className="text-left">
                                            <div className="font-medium">Monthly Report</div>
                                            <div className="text-xs text-muted-foreground">Complete monthly analysis</div>
                                        </div>
                                    </Button>
                                    <Button variant="outline" className="h-auto p-4 justify-start gap-3">
                                        <Download className="w-5 h-5" />
                                        <div className="text-left">
                                            <div className="font-medium">Defaulters List</div>
                                            <div className="text-xs text-muted-foreground">Students below 75% attendance</div>
                                        </div>
                                    </Button>
                                    <Button variant="outline" className="h-auto p-4 justify-start gap-3">
                                        <Download className="w-5 h-5" />
                                        <div className="text-left">
                                            <div className="font-medium">Custom Report</div>
                                            <div className="text-xs text-muted-foreground">Generate custom date range report</div>
                                        </div>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <Card className="border-border/50 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                    Attendance Settings
                                </CardTitle>
                                <CardDescription>
                                    Configure attendance thresholds and policies.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Minimum Attendance Threshold (%)</Label>
                                            <Input type="number" defaultValue="75" min="0" max="100" className="mt-2" />
                                        </div>
                                        <div>
                                            <Label>Warning Threshold (%)</Label>
                                            <Input type="number" defaultValue="65" min="0" max="100" className="mt-2" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Slot Lock Buffer (minutes)</Label>
                                            <Input type="number" defaultValue="15" min="0" max="60" className="mt-2" />
                                        </div>
                                        <div>
                                            <Label>Time Zone</Label>
                                            <Select defaultValue="Asia/Kolkata">
                                                <SelectTrigger className="mt-2">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <Button className="mt-4">Save Settings</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Confirmation Dialog */}
                <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Confirm Attendance Override
                            </DialogTitle>
                            <DialogDescription>
                                You are about to override attendance for {getSelectedStudents().length} students.
                                This action will be logged.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-4">
                            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Students:</span>
                                    <span className="font-medium">{getSelectedStudents().length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date:</span>
                                    <span className="font-medium">{overrideDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Slot:</span>
                                    <span className="font-medium">
                                        {availableSlots.find(s => s.id === overrideSlot)?.subjectName || overrideSlot}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status:</span>
                                    <Badge className={cn(
                                        overrideStatus === "PRESENT" && "bg-green-500",
                                        overrideStatus === "ABSENT" && "bg-red-500",
                                        overrideStatus === "EXCUSED" && "bg-blue-500"
                                    )}>
                                        {overrideStatus}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground">Reason</Label>
                                <p className="text-sm mt-1">{overrideReason}</p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={confirmOverride} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Confirm Override"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </AdminLayout>
    );
};

export default AdminAttendance;
