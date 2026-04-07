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

    // Notification Form State (Matching Admin Alerts)
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [isNotificationSubmitting, setIsNotificationSubmitting] = useState(false);
    const [notificationForm, setNotificationForm] = useState({
        title: "",
        message: "",
        urgency: "normal" as "normal" | "important" | "critical",
        targetType: "all" as "all" | "students" | "faculty" | "custom",
        category: "general" as "general" | "academic" | "placement" | "event" | "emergency",
        branches: [] as string[],
        sections: [] as string[],
        years: [] as string[],
    });

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

    const handleNotificationSubmit = async () => {
        if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
            toast({
                title: "Missing Fields",
                description: "Please fill in Title and Message.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsNotificationSubmitting(true);
            const targetAudience: any = { type: notificationForm.targetType };
            
            if (notificationForm.targetType === 'custom') {
                if (notificationForm.branches.length > 0) targetAudience.branches = notificationForm.branches;
                if (notificationForm.sections.length > 0) targetAudience.sections = notificationForm.sections;
                if (notificationForm.years.length > 0) targetAudience.years = notificationForm.years;
            }

            await sendNotification({
                title: notificationForm.title,
                message: notificationForm.message,
                urgency: notificationForm.urgency,
                targetAudience,
                category: notificationForm.category,
            });

            toast({ title: "Alert Sent Successfully!" });
            
            setNotificationForm({
                title: "",
                message: "",
                urgency: "normal",
                targetType: "all",
                category: "general",
                branches: [],
                sections: [],
                years: [],
            });
            setIsAlertModalOpen(false);
            fetchNotifications();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to send alert.",
                variant: "destructive"
            });
        } finally {
             setIsNotificationSubmitting(false);
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

                        <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex gap-2">
                                    <Send className="w-4 h-4" /> Send Alert
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="flex gap-2 items-center text-xl">
                                        <Bell className="w-5 h-5 text-primary" /> Send Alert
                                    </DialogTitle>
                                </DialogHeader>
                                
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Title <span className="text-destructive">*</span></Label>
                                        <Input
                                            value={notificationForm.title}
                                            onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                                            placeholder="e.g. Test Cancelled" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Message <span className="text-destructive">*</span></Label>
                                        <Textarea
                                            value={notificationForm.message}
                                            onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                                            placeholder="Enter your notification message..."
                                            rows={4}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Urgency</Label>
                                        <Select
                                            value={notificationForm.urgency}
                                            onValueChange={(value: "normal" | "important" | "critical") => setNotificationForm({ ...notificationForm, urgency: value })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="normal">Normal</SelectItem>
                                                <SelectItem value="important">Important</SelectItem>
                                                <SelectItem value="critical">Critical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select
                                            value={notificationForm.category}
                                            onValueChange={(value: "general" | "academic" | "placement" | "event" | "emergency") => setNotificationForm({ ...notificationForm, category: value })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="general">General</SelectItem>
                                                <SelectItem value="academic">Academic</SelectItem>
                                                <SelectItem value="placement">Placement</SelectItem>
                                                <SelectItem value="event">Event</SelectItem>
                                                <SelectItem value="emergency">Emergency</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Target Audience */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Target Audience</Label>
                                        <Select
                                            value={notificationForm.targetType}
                                            onValueChange={(value: "all" | "students" | "faculty" | "custom") =>
                                                setNotificationForm({ ...notificationForm, targetType: value })
                                            }
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Users</SelectItem>
                                                <SelectItem value="students">All Students</SelectItem>
                                                <SelectItem value="faculty">All Faculty</SelectItem>
                                                <SelectItem value="custom">Custom (Specific Branches/Sections)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Custom Targeting Options */}
                                    {notificationForm.targetType === "custom" && (
                                        <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20">
                                            <p className="text-sm font-medium text-foreground">Custom Targeting Options</p>

                                            <div className="space-y-2">
                                                <Label className="text-sm">Branches (comma-separated)</Label>
                                                <Input
                                                    value={notificationForm.branches.join(", ")}
                                                    onChange={(e) =>
                                                        setNotificationForm({
                                                            ...notificationForm,
                                                            branches: e.target.value.split(",").map((b) => b.trim()).filter((b) => b),
                                                        })
                                                    }
                                                    placeholder="e.g., CSE, ECE"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm">Sections (comma-separated)</Label>
                                                <Input
                                                    value={notificationForm.sections.join(", ")}
                                                    onChange={(e) =>
                                                        setNotificationForm({
                                                            ...notificationForm,
                                                            sections: e.target.value.split(",").map((s) => s.trim()).filter((s) => s),
                                                        })
                                                    }
                                                    placeholder="e.g., A, B"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm">Years (comma-separated)</Label>
                                                <Input
                                                    value={notificationForm.years.join(", ")}
                                                    onChange={(e) =>
                                                        setNotificationForm({
                                                            ...notificationForm,
                                                            years: e.target.value.split(",").map((y) => y.trim()).filter((y) => y),
                                                        })
                                                    }
                                                    placeholder="e.g., 1, 2, 3, 4"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                                        <Button variant="outline" onClick={() => setIsAlertModalOpen(false)}>Cancel</Button>
                                        <Button
                                            onClick={handleNotificationSubmit}
                                            disabled={isNotificationSubmitting}
                                            className="min-w-[140px] bg-blue-600 hover:bg-blue-700 rounded-xl"
                                        >
                                            {isNotificationSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Send Alert
                                                </>
                                            )}
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
