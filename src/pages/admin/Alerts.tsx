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
} from "lucide-react";

const AdminAlerts = () => {
    const { userData } = useAuth();
    const { allNotifications, loading, error, fetchNotifications, deleteNotification } = useNotifications();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [urgencyFilter, setUrgencyFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [deletingId, setDeletingId] = useState<string | null>(null);

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
                        variant="outline"
                        onClick={fetchNotifications}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4" />
                        )}
                        Refresh
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
            </div>
        </AdminLayout>
    );
};

export default AdminAlerts;
