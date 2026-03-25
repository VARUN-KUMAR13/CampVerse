import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import AdminLayout from "@/components/AdminLayout";
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
    Plus,
    Send,
} from "lucide-react";

const AdminAlerts = () => {
    const { userData } = useAuth();
    const { allNotifications, loading, error, fetchNotifications, deleteNotification, sendNotification } = useNotifications();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [urgencyFilter, setUrgencyFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Notification Form State (Matching Dashboard)
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
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

            toast({ title: "Success!", description: "Notification sent successfully." });
            
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
            setIsNotificationModalOpen(false);
            fetchNotifications(); // Refresh the list
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to send notification.",
                variant: "destructive",
            });
        } finally {
            setIsNotificationSubmitting(false);
        }
    };

    // Fetch notifications when component mounts
    useEffect(() => {
        fetchNotifications();
    }, []);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getUrgencyBadge = (urgency: string) => {
        switch (urgency) {
            case "critical":
                return <Badge className="bg-red-500">Critical</Badge>;
            case "important":
                return <Badge className="bg-amber-500">Important</Badge>;
            default:
                return <Badge variant="secondary">Normal</Badge>;
        }
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

    const getTargetAudienceText = (target: any) => {
        if (!target) return "All Users";
        if (target.type === "all") return "All Users";
        if (target.type === "students") return "All Students";
        if (target.type === "faculty") return "All Faculty";
        if (target.type === "custom") {
            const parts = [];
            if (target.branches?.length) parts.push(`Branches: ${target.branches.join(", ")}`);
            if (target.sections?.length) parts.push(`Sections: ${target.sections.join(", ")}`);
            if (target.years?.length) parts.push(`Years: ${target.years.join(", ")}`);
            return parts.length > 0 ? parts.join(" | ") : "Custom";
        }
        return "Unknown";
    };

    const handleDelete = async (notificationId: string) => {
        try {
            setDeletingId(notificationId);
            await deleteNotification(notificationId);
            toast({
                title: "Deleted!",
                description: "Notification has been deleted successfully.",
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to delete notification.",
                variant: "destructive",
            });
        } finally {
            setDeletingId(null);
        }
    };

    const filteredNotifications = allNotifications.filter((notification) => {
        const matchesSearch =
            notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesUrgency =
            urgencyFilter === "all" || notification.urgency === urgencyFilter;
        const matchesCategory =
            categoryFilter === "all" || notification.category === categoryFilter;
        return matchesSearch && matchesUrgency && matchesCategory;
    });

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <Bell className="w-8 h-8 text-primary" />
                            Notification History
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            View and manage all notifications sent via the system
                        </p>
                    </div>
                    <Button 
                        onClick={() => setIsNotificationModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 border-none px-6 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/20 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Send Alert
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Bell className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Alerts</p>
                                <p className="text-2xl font-bold">{allNotifications.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Critical</p>
                                <p className="text-2xl font-bold">
                                    {allNotifications.filter((n) => n.urgency === "critical").length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Important</p>
                                <p className="text-2xl font-bold">
                                    {allNotifications.filter((n) => n.urgency === "important").length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Normal</p>
                                <p className="text-2xl font-bold">
                                    {allNotifications.filter((n) => n.urgency === "normal").length}
                                </p>
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
                                        placeholder="Search notifications..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Urgency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Urgency</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="important">Important</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="academic">Academic</SelectItem>
                                    <SelectItem value="placement">Placement</SelectItem>
                                    <SelectItem value="event">Event</SelectItem>
                                    <SelectItem value="emergency">Emergency</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Display */}
                {error && (
                    <Card className="border-destructive bg-destructive/10">
                        <CardContent className="p-4 text-destructive">
                            {error}
                        </CardContent>
                    </Card>
                )}

                {/* Loading State */}
                {loading && allNotifications.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                            <p className="text-muted-foreground">Loading notifications...</p>
                        </CardContent>
                    </Card>
                )}

                {/* Notifications List */}
                {!loading && filteredNotifications.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                No notifications found
                            </h3>
                            <p className="text-muted-foreground">
                                {allNotifications.length === 0
                                    ? "No notifications have been sent yet. Send one from the Dashboard!"
                                    : "Try adjusting your search or filters."}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredNotifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className={`hover:shadow-lg transition-shadow ${notification.urgency === "critical"
                                    ? "border-l-4 border-l-red-500"
                                    : notification.urgency === "important"
                                        ? "border-l-4 border-l-amber-500"
                                        : ""
                                    }`}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            {/* Title and Badges */}
                                            <div className="flex items-start gap-3 flex-wrap">
                                                <h3 className="text-lg font-bold text-foreground">
                                                    {notification.title || "Notification"}
                                                </h3>
                                                {getUrgencyBadge(notification.urgency)}
                                                {getCategoryBadge(notification.category)}
                                            </div>

                                            {/* Message */}
                                            <p className="text-muted-foreground">
                                                {notification.message}
                                            </p>

                                            {/* Meta Info */}
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {formatDate(notification.createdAt)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {notification.postedBy?.name || "Admin"} ({notification.postedBy?.role || "admin"})
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {getTargetAudienceText(notification.targetAudience)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Delete Button */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    disabled={deletingId === notification.id}
                                                >
                                                    {deletingId === notification.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Notification?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete this notification? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(notification.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Notification Modal (Reused from Dashboard) */}
                <Dialog
                    open={isNotificationModalOpen}
                    onOpenChange={setIsNotificationModalOpen}
                >
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <Bell className="w-6 h-6 text-primary" />
                                Send Notification Alert
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5 py-4">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">
                                    Alert Title <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    value={notificationForm.title}
                                    onChange={(e) =>
                                        setNotificationForm({ ...notificationForm, title: e.target.value })
                                    }
                                    placeholder="e.g., Important: Exam Schedule Update"
                                />
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">
                                    Message <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    value={notificationForm.message}
                                    onChange={(e) =>
                                        setNotificationForm({ ...notificationForm, message: e.target.value })
                                    }
                                    placeholder="Enter your notification message..."
                                    rows={4}
                                />
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Category</Label>
                                <Select
                                    value={notificationForm.category}
                                    onValueChange={(value: "general" | "academic" | "placement" | "event" | "emergency") =>
                                        setNotificationForm({ ...notificationForm, category: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
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
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
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

                                    {/* Branches */}
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
                                            placeholder="e.g., CSE, ECE, EEE"
                                        />
                                        <p className="text-xs text-muted-foreground">Leave empty to include all branches</p>
                                    </div>

                                    {/* Sections */}
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
                                            placeholder="e.g., A, B, C"
                                        />
                                        <p className="text-xs text-muted-foreground">Leave empty to include all sections</p>
                                    </div>

                                    {/* Years */}
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
                                        <p className="text-xs text-muted-foreground">Leave empty to include all years</p>
                                    </div>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsNotificationModalOpen(false)}
                                    disabled={isNotificationSubmitting}
                                >
                                    Cancel
                                </Button>
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
        </AdminLayout>
    );
};

export default AdminAlerts;
