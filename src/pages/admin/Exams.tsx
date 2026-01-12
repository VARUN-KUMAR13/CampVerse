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
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useExams, Exam } from "@/contexts/ExamContext";
import { useToast } from "@/hooks/use-toast";
import {
    Calendar,
    Clock,
    RefreshCw,
    Loader2,
    Search,
    Plus,
    Trash2,
    MapPin,
    CheckCircle,
    AlertTriangle,
    XCircle,
} from "lucide-react";

const AdminExams = () => {
    const { userData } = useAuth();
    const { exams, loading, error, fetchExams, addExam, deleteExam, updateExamStatus } = useExams();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [examForm, setExamForm] = useState({
        title: "",
        examType: "Mid-Term" as Exam["examType"],
        date: "",
        startTime: "",
        endTime: "",
        venue: "",
        branches: "",
        sections: "",
        years: "",
        status: "Scheduled" as Exam["status"],
    });

    useEffect(() => {
        fetchExams();
    }, []);

    const resetForm = () => {
        setExamForm({
            title: "",
            examType: "Mid-Term",
            date: "",
            startTime: "",
            endTime: "",
            venue: "",
            branches: "",
            sections: "",
            years: "",
            status: "Scheduled",
        });
    };

    const handleSubmit = async () => {
        if (!examForm.title || !examForm.date || !examForm.startTime || !examForm.endTime) {
            toast({
                title: "Missing Fields",
                description: "Please fill in Title, Date, Start Time and End Time.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsSubmitting(true);

            // Build target audience
            const branches = examForm.branches.split(",").map((b) => b.trim()).filter((b) => b);
            const sections = examForm.sections.split(",").map((s) => s.trim()).filter((s) => s);
            const years = examForm.years.split(",").map((y) => y.trim()).filter((y) => y);

            const examData: any = {
                exam_id: `EXAM${Date.now()}`,
                title: examForm.title,
                course: examForm.title,
                examType: examForm.examType,
                date: examForm.date,
                startTime: examForm.startTime,
                endTime: examForm.endTime,
                venue: examForm.venue || undefined,
                status: examForm.status,
                postedBy: userData?.collegeId || "admin",
            };

            if (branches.length || sections.length || years.length) {
                examData.targetAudience = {
                    branches: branches.length ? branches : undefined,
                    sections: sections.length ? sections : undefined,
                    years: years.length ? years : undefined,
                };
            }

            await addExam(examData);

            toast({
                title: "Success!",
                description: "Exam scheduled successfully.",
            });

            resetForm();
            setIsAddModalOpen(false);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to schedule exam.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setDeletingId(id);
            await deleteExam(id);
            toast({
                title: "Deleted!",
                description: "Exam has been deleted successfully.",
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to delete exam.",
                variant: "destructive",
            });
        } finally {
            setDeletingId(null);
        }
    };

    const handleStatusChange = async (id: string, status: Exam["status"]) => {
        try {
            await updateExamStatus(id, status);
            toast({
                title: "Updated!",
                description: `Exam status changed to ${status}.`,
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to update status.",
                variant: "destructive",
            });
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Scheduled":
                return <Badge className="bg-blue-500">Scheduled</Badge>;
            case "Ongoing":
                return <Badge className="bg-green-500">Ongoing</Badge>;
            case "Completed":
                return <Badge variant="secondary">Completed</Badge>;
            case "Postponed":
                return <Badge className="bg-amber-500">Postponed</Badge>;
            case "Cancelled":
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        const colors: { [key: string]: string } = {
            "Mid-Term": "bg-purple-500",
            "End-Term": "bg-indigo-500",
            "Quiz": "bg-cyan-500",
            "Practical": "bg-green-500",
            "Viva": "bg-pink-500",
            "Assignment": "bg-amber-500",
            "Other": "bg-gray-500",
        };
        return <Badge className={colors[type] || "bg-gray-500"}>{type}</Badge>;
    };

    const filteredExams = exams.filter((exam) => {
        const matchesSearch =
            exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.exam_id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || exam.status === statusFilter;
        const matchesType = typeFilter === "all" || exam.examType === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                                <Calendar className="w-8 h-8 text-primary" />
                                Exam Management
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Schedule and manage exams for students
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={fetchExams} disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                <span className="ml-2">Refresh</span>
                            </Button>
                            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Schedule Exam
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2 text-xl">
                                            <Calendar className="w-6 h-6 text-primary" />
                                            Post Upcoming Exam
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        {/* Exam Title */}
                                        <div className="space-y-2">
                                            <Label>Exam Title <span className="text-destructive">*</span></Label>
                                            <Input
                                                value={examForm.title}
                                                onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                                                placeholder="e.g., Mid Semester Examination - I"
                                            />
                                        </div>

                                        {/* Type and Date */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Exam Type</Label>
                                                <Select
                                                    value={examForm.examType}
                                                    onValueChange={(value) => setExamForm({ ...examForm, examType: value as Exam["examType"] })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                                                        <SelectItem value="End-Term">End-Term</SelectItem>
                                                        <SelectItem value="Quiz">Quiz</SelectItem>
                                                        <SelectItem value="Practical">Practical</SelectItem>
                                                        <SelectItem value="Viva">Viva</SelectItem>
                                                        <SelectItem value="Assignment">Assignment</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Date <span className="text-destructive">*</span></Label>
                                                <Input
                                                    type="date"
                                                    value={examForm.date}
                                                    onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Time and Venue */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Start Time <span className="text-destructive">*</span></Label>
                                                <Input
                                                    type="time"
                                                    value={examForm.startTime}
                                                    onChange={(e) => setExamForm({ ...examForm, startTime: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>End Time <span className="text-destructive">*</span></Label>
                                                <Input
                                                    type="time"
                                                    value={examForm.endTime}
                                                    onChange={(e) => setExamForm({ ...examForm, endTime: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Venue</Label>
                                                <Input
                                                    value={examForm.venue}
                                                    onChange={(e) => setExamForm({ ...examForm, venue: e.target.value })}
                                                    placeholder="Room 101"
                                                />
                                            </div>
                                        </div>

                                        {/* Target Audience */}
                                        <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                                            <div>
                                                <p className="text-sm font-semibold">Target Audience (Optional)</p>
                                                <p className="text-xs text-muted-foreground">Leave empty for all students</p>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <Input
                                                    value={examForm.branches}
                                                    onChange={(e) => setExamForm({ ...examForm, branches: e.target.value })}
                                                    placeholder="Branches: CSE, ECE"
                                                />
                                                <Input
                                                    value={examForm.sections}
                                                    onChange={(e) => setExamForm({ ...examForm, sections: e.target.value })}
                                                    placeholder="Sections: A, B"
                                                />
                                                <Input
                                                    value={examForm.years}
                                                    onChange={(e) => setExamForm({ ...examForm, years: e.target.value })}
                                                    placeholder="Years: 2, 3"
                                                />
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <div className="flex justify-end gap-3 pt-4 border-t">
                                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Posting...
                                                    </>
                                                ) : (
                                                    "Post Exam"
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold">{exams.length}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Scheduled</p>
                                    <p className="text-2xl font-bold">{exams.filter((e) => e.status === "Scheduled").length}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                    <p className="text-2xl font-bold">{exams.filter((e) => e.status === "Completed").length}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Postponed</p>
                                    <p className="text-2xl font-bold">{exams.filter((e) => e.status === "Postponed").length}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                                    <XCircle className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Cancelled</p>
                                    <p className="text-2xl font-bold">{exams.filter((e) => e.status === "Cancelled").length}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <Input
                                            placeholder="Search exams..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full md:w-[150px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Postponed">Postponed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-full md:w-[150px]">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                                        <SelectItem value="End-Term">End-Term</SelectItem>
                                        <SelectItem value="Quiz">Quiz</SelectItem>
                                        <SelectItem value="Practical">Practical</SelectItem>
                                        <SelectItem value="Viva">Viva</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error */}
                    {error && (
                        <Card className="border-destructive bg-destructive/10">
                            <CardContent className="p-4 text-destructive">{error}</CardContent>
                        </Card>
                    )}

                    {/* Loading */}
                    {loading && exams.length === 0 && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                                <p className="text-muted-foreground">Loading exams...</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Exams List */}
                    {!loading && filteredExams.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-foreground mb-2">No exams found</h3>
                                <p className="text-muted-foreground">
                                    {exams.length === 0
                                        ? "No exams scheduled yet. Click 'Schedule Exam' to add one."
                                        : "Try adjusting your search or filters."}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredExams.map((exam) => (
                                <Card key={exam._id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-start gap-3 flex-wrap">
                                                    <h3 className="text-lg font-bold text-foreground">{exam.title}</h3>
                                                    {getStatusBadge(exam.status)}
                                                    {getTypeBadge(exam.examType)}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(exam.date)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {exam.startTime} - {exam.endTime}
                                                    </span>
                                                    {exam.venue && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            {exam.venue}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={exam.status}
                                                    onValueChange={(value) => handleStatusChange(exam._id, value as Exam["status"])}
                                                >
                                                    <SelectTrigger className="w-[120px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                                                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                                                        <SelectItem value="Completed">Completed</SelectItem>
                                                        <SelectItem value="Postponed">Postponed</SelectItem>
                                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            disabled={deletingId === exam._id}
                                                        >
                                                            {deletingId === exam._id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Exam?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{exam.title}"? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(exam._id)}
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
                </div>
            </div>
        </div>
    );
};

export default AdminExams;
