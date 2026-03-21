import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import FacultyLayout from "@/components/FacultyLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useToast } from "@/hooks/use-toast";
import {
    Bell,
    RefreshCw,
    Loader2,
    Search,
    AlertTriangle,
    CheckCircle,
    User,
    Users,
    Clock,
    Trash2,
    Send,
    BookOpen,
} from "lucide-react";

interface FacultyCourseAssignment {
    courseCode: string;
    courseName: string;
    sections: string[];
    department: string;
    year: string;
    semester: string;
}

const FacultyAlerts = () => {
    const { userData } = useAuth();
    const { allNotifications, loading, error, fetchNotifications, deleteNotification, sendNotification } = useNotifications();
    const { toast } = useToast();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form logic
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [category, setCategory] = useState<"general" | "academic" | "placement" | "event" | "emergency">("academic");
    const [selectedCourseStr, setSelectedCourseStr] = useState(""); 
    const [selectedSection, setSelectedSection] = useState("");
    
    const [facultyCourses, setFacultyCourses] = useState<FacultyCourseAssignment[]>([]);

    useEffect(() => {
        fetchNotifications();
        if (userData?.collegeId) {
            fetchAssignments();
        }
    }, [userData]);

    const fetchAssignments = async () => {
        try {
            const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const res = await fetch(`${apiBaseUrl}/api/faculty-assignments?facultyId=${userData?.collegeId}`);
            if (res.ok) {
                const data = await res.json();
                setFacultyCourses(data);
            }
        } catch (error) {
            console.error("Failed to fetch faculty assignments:", error);
        }
    };

    const handleSendAlert = async () => {
        if (!title.trim() || !message.trim() || !selectedCourseStr || !selectedSection) {
            toast({
                title: "Missing Fields",
                description: "Please fill all required fields.",
                variant: "destructive"
            });
            return;
        }

        const selectedCourse = facultyCourses.find(c => c.courseCode === selectedCourseStr);
        if (!selectedCourse) return;

        setIsSubmitting(true);
        try {
            await sendNotification({
                title,
                message,
                urgency: "important",
                category,
                targetAudience: {
                    type: "faculty_alert",
                    courseCode: selectedCourse.courseCode,
                    sections: [selectedSection],
                    years: [selectedCourse.year],
                    semester: selectedCourse.semester,
                }
            });

            toast({ title: "Alert Sent Successfully!" });
            
            setTitle("");
            setMessage("");
            setSelectedCourseStr("");
            setSelectedSection("");
            setIsAlertModalOpen(false);
            fetchNotifications();
        } catch (error) {
            toast({
                title: "Error sending alert",
                variant: "destructive"
            });
        } finally {
             setIsSubmitting(false);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getCategoryBadge = (category?: string) => {
        const colors: { [key: string]: string } = {
            general: "bg-gray-500",
            academic: "bg-blue-500",
            placement: "bg-green-500",
            event: "bg-purple-500",
            emergency: "bg-red-500",
        };
        return (
            <Badge className={colors[category || "general"] || "bg-gray-500"}>
                {(category || "general").charAt(0).toUpperCase() + (category || "general").slice(1)}
            </Badge>
        );
    };

    // Filter to only show notifications created by this faculty
    const facultyNotifications = allNotifications.filter(n => n.postedBy?.collegeId === userData?.collegeId);

    const filteredNotifications = facultyNotifications.filter((notification) => {
        const matchesSearch =
            notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            categoryFilter === "all" || notification.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleDelete = async (notificationId: string) => {
        try {
            setDeletingId(notificationId);
            await deleteNotification(notificationId);
            toast({
                title: "Deleted!",
                description: "Alert has been deleted successfully.",
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to delete alert.",
                variant: "destructive",
            });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <FacultyLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <Bell className="w-8 h-8 text-primary" />
                            Faculty Alerts
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Send contextual notifications to your course batches
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={fetchNotifications}
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            Refresh
                        </Button>
                        <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex gap-2">
                                    <Send className="w-4 h-4" /> Send Alert
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl">
                                <DialogHeader>
                                    <DialogTitle className="flex gap-2 items-center text-xl">
                                        <Bell className="w-5 h-5 text-primary" /> Send Class Alert
                                    </DialogTitle>
                                </DialogHeader>
                                
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Title <span className="text-destructive">*</span></Label>
                                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Test Cancelled" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Message <span className="text-destructive">*</span></Label>
                                        <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Details..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="academic">Academic</SelectItem>
                                                <SelectItem value="event">Event</SelectItem>
                                                <SelectItem value="emergency">Emergency</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Course <span className="text-destructive">*</span></Label>
                                            <Select value={selectedCourseStr} onValueChange={(v) => { setSelectedCourseStr(v); setSelectedSection(""); }}>
                                                <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                                                <SelectContent>
                                                    {facultyCourses.map(c => (
                                                        <SelectItem key={c.courseCode} value={c.courseCode}>{c.courseName} ({c.courseCode})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Section <span className="text-destructive">*</span></Label>
                                            <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!selectedCourseStr}>
                                                <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
                                                <SelectContent>
                                                    {facultyCourses.find(c => c.courseCode === selectedCourseStr)?.sections.map(s => (
                                                        <SelectItem key={s} value={s}>Section {s}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                                        <Button variant="outline" onClick={() => setIsAlertModalOpen(false)}>Cancel</Button>
                                        <Button onClick={handleSendAlert} disabled={isSubmitting}>
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Bell className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">My Alerts Sent</p>
                                <p className="text-2xl font-bold">{facultyNotifications.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Assigned Courses</p>
                                <p className="text-2xl font-bold">{facultyCourses.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input placeholder="Search alerts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                                </div>
                            </div>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="academic">Academic</SelectItem>
                                    <SelectItem value="emergency">Emergency</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {!loading && filteredNotifications.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">No alerts found</h3>
                            <p className="text-muted-foreground">Send contextual alerts using the "Send Alert" button.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredNotifications.map((notification) => (
                            <Card key={notification.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start gap-3 flex-wrap">
                                                <h3 className="text-lg font-bold text-foreground">{notification.title}</h3>
                                                {getCategoryBadge(notification.category)}
                                                <Badge variant="outline">Course: {notification.targetAudience.courseCode}</Badge>
                                                <Badge variant="outline">Section: {notification.targetAudience.sections?.[0]}</Badge>
                                            </div>
                                            <p className="text-muted-foreground">{notification.message}</p>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatDate(notification.createdAt)}</span>
                                                <span className="flex items-center gap-1"><Users className="w-4 h-4" />Targeted Batch</span>
                                            </div>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="text-destructive" disabled={deletingId === notification.id}>
                                                    {deletingId === notification.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Alert?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will delete the alert permanently.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(notification.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </FacultyLayout>
    );
};

export default FacultyAlerts;
