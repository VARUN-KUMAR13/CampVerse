import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents, Event } from "@/contexts/EventContext";
import { useToast } from "@/hooks/use-toast";
import {
    Plus,
    Calendar,
    Users,
    Edit,
    Trash2,
    Eye,
    RefreshCw,
    Loader2,
    MapPin,
    Clock,
    Star,
    DollarSign,
    Trophy,
    CalendarDays,
} from "lucide-react";

const AdminEvents = () => {
    const { userData } = useAuth();
    const { events, loading, error, addEvent, deleteEvent, fetchEvents } = useEvents();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const [newEvent, setNewEvent] = useState({
        event_id: "",
        title: "",
        category: "",
        date: "",
        endDate: "",
        time: "",
        endTime: "",
        venue: "",
        organizer: "",
        description: "",
        entryFee: "Free",
        maxParticipants: "",
        prizes: "",
        registrationDeadline: "",
        highlights: "",
        contactEmail: "",
        contactPhone: "",
        featured: false,
    });

    // Generate unique Event ID
    const generateEventId = () => {
        const title = newEvent.title.replace(/\s+/g, "").toUpperCase().slice(0, 8);
        const year = new Date().getFullYear();
        return `${title || "EVENT"}${year}`;
    };

    const handleAddEvent = async () => {
        // Validate required fields
        if (!newEvent.event_id || !newEvent.title || !newEvent.category || !newEvent.date || !newEvent.venue || !newEvent.organizer) {
            toast({
                title: "Missing Fields",
                description: "Please fill in Event ID, Title, Category, Date, Venue, and Organizer.",
                variant: "destructive",
            });
            return;
        }

        // Combine date and time
        let eventDate = newEvent.date;
        if (newEvent.time) {
            eventDate = `${newEvent.date}T${newEvent.time}:00`;
        }

        let eventEndDate = newEvent.endDate || newEvent.date;
        if (newEvent.endTime) {
            eventEndDate = `${newEvent.endDate || newEvent.date}T${newEvent.endTime}:00`;
        }

        const eventData = {
            event_id: newEvent.event_id,
            title: newEvent.title,
            category: newEvent.category,
            date: eventDate,
            endDate: eventEndDate,
            venue: newEvent.venue,
            organizer: newEvent.organizer,
            description: newEvent.description,
            entryFee: newEvent.entryFee || "Free",
            maxParticipants: newEvent.maxParticipants ? parseInt(newEvent.maxParticipants) : 0,
            prizes: newEvent.prizes,
            registrationDeadline: newEvent.registrationDeadline || newEvent.date,
            highlights: newEvent.highlights ? newEvent.highlights.split(",").map((h) => h.trim()) : [],
            contactEmail: newEvent.contactEmail,
            contactPhone: newEvent.contactPhone,
            featured: newEvent.featured,
            status: "Open",
        };

        try {
            setIsSubmitting(true);
            console.log("Admin adding event to MongoDB:", eventData);
            await addEvent(eventData as any);

            toast({
                title: "Success!",
                description: "Event created successfully. Students can now see it.",
            });

            // Reset form
            setNewEvent({
                event_id: "",
                title: "",
                category: "",
                date: "",
                endDate: "",
                time: "",
                endTime: "",
                venue: "",
                organizer: "",
                description: "",
                entryFee: "Free",
                maxParticipants: "",
                prizes: "",
                registrationDeadline: "",
                highlights: "",
                contactEmail: "",
                contactPhone: "",
                featured: false,
            });
            setIsAddModalOpen(false);
        } catch (err: any) {
            console.error("Error adding event:", err);
            toast({
                title: "Error",
                description: err.message || "Failed to create event. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            await deleteEvent(eventId);
            toast({
                title: "Success",
                description: "Event deleted successfully.",
            });
        } catch (err: any) {
            console.error("Error deleting event:", err);
            toast({
                title: "Error",
                description: err.message || "Failed to delete event.",
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Open":
                return <Badge className="bg-green-500">Open</Badge>;
            case "Closed":
                return <Badge variant="destructive">Closed</Badge>;
            case "Completed":
                return <Badge variant="secondary">Completed</Badge>;
            case "Cancelled":
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getCategoryBadge = (category: string) => {
        const colors: { [key: string]: string } = {
            Technical: "bg-blue-500",
            Cultural: "bg-purple-500",
            Sports: "bg-green-500",
            Workshop: "bg-orange-500",
            Seminar: "bg-cyan-500",
            Competition: "bg-red-500",
            Other: "bg-gray-500",
        };
        return <Badge className={colors[category] || "bg-gray-500"}>{category}</Badge>;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    // Filter events
    const filteredEvents = events.filter((event) => {
        const matchesSearch =
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.event_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            categoryFilter === "all" || event.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <AdminLayout>
            <main className="p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                                <CalendarDays className="w-8 h-8 text-primary" />
                                Event Management
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage campus events and activities
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={fetchEvents}
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
                            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                                        <Plus className="w-4 h-4" />
                                        Create Event
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                            <CalendarDays className="w-6 h-6 text-primary" />
                                            Create New Event
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-5 py-4">
                                        {/* Event ID and Title */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">
                                                    Event ID <span className="text-destructive">*</span>
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={newEvent.event_id}
                                                        onChange={(e) =>
                                                            setNewEvent({ ...newEvent, event_id: e.target.value.toUpperCase() })
                                                        }
                                                        placeholder="e.g., HACKATHON2025"
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setNewEvent({ ...newEvent, event_id: generateEventId() })}
                                                    >
                                                        Auto
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">
                                                    Event Title <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    value={newEvent.title}
                                                    onChange={(e) =>
                                                        setNewEvent({ ...newEvent, title: e.target.value })
                                                    }
                                                    placeholder="e.g., CodeStorm Hackathon"
                                                />
                                            </div>
                                        </div>

                                        {/* Category and Organizer */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">
                                                    Category <span className="text-destructive">*</span>
                                                </Label>
                                                <Select
                                                    value={newEvent.category}
                                                    onValueChange={(value) =>
                                                        setNewEvent({ ...newEvent, category: value })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Technical">Technical</SelectItem>
                                                        <SelectItem value="Cultural">Cultural</SelectItem>
                                                        <SelectItem value="Sports">Sports</SelectItem>
                                                        <SelectItem value="Workshop">Workshop</SelectItem>
                                                        <SelectItem value="Seminar">Seminar</SelectItem>
                                                        <SelectItem value="Competition">Competition</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">
                                                    Organizer <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    value={newEvent.organizer}
                                                    onChange={(e) =>
                                                        setNewEvent({ ...newEvent, organizer: e.target.value })
                                                    }
                                                    placeholder="e.g., IEEE Student Branch"
                                                />
                                            </div>
                                        </div>

                                        {/* Venue */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">
                                                Venue <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                value={newEvent.venue}
                                                onChange={(e) =>
                                                    setNewEvent({ ...newEvent, venue: e.target.value })
                                                }
                                                placeholder="e.g., Main Auditorium, CS Block"
                                            />
                                        </div>

                                        {/* Dates and Times */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    Start Date & Time <span className="text-destructive">*</span>
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="date"
                                                        value={newEvent.date}
                                                        onChange={(e) =>
                                                            setNewEvent({ ...newEvent, date: e.target.value })
                                                        }
                                                        min={new Date().toISOString().split("T")[0]}
                                                        className="flex-1"
                                                    />
                                                    <Input
                                                        type="time"
                                                        value={newEvent.time}
                                                        onChange={(e) =>
                                                            setNewEvent({ ...newEvent, time: e.target.value })
                                                        }
                                                        className="w-32"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    End Date & Time
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="date"
                                                        value={newEvent.endDate}
                                                        onChange={(e) =>
                                                            setNewEvent({ ...newEvent, endDate: e.target.value })
                                                        }
                                                        min={newEvent.date || new Date().toISOString().split("T")[0]}
                                                        className="flex-1"
                                                    />
                                                    <Input
                                                        type="time"
                                                        value={newEvent.endTime}
                                                        onChange={(e) =>
                                                            setNewEvent({ ...newEvent, endTime: e.target.value })
                                                        }
                                                        className="w-32"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">Event Description</Label>
                                            <Textarea
                                                value={newEvent.description}
                                                onChange={(e) =>
                                                    setNewEvent({ ...newEvent, description: e.target.value })
                                                }
                                                placeholder="Share agenda, speakers, eligibility..."
                                                rows={3}
                                            />
                                        </div>

                                        {/* Entry Fee, Max Participants, Prizes */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">Entry Fee</Label>
                                                <Input
                                                    value={newEvent.entryFee}
                                                    onChange={(e) =>
                                                        setNewEvent({ ...newEvent, entryFee: e.target.value })
                                                    }
                                                    placeholder="Free, ₹200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">Max Participants</Label>
                                                <Input
                                                    type="number"
                                                    value={newEvent.maxParticipants}
                                                    onChange={(e) =>
                                                        setNewEvent({ ...newEvent, maxParticipants: e.target.value })
                                                    }
                                                    placeholder="0 = unlimited"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold flex items-center gap-1">
                                                    <Trophy className="w-4 h-4" />
                                                    Prizes
                                                </Label>
                                                <Input
                                                    value={newEvent.prizes}
                                                    onChange={(e) =>
                                                        setNewEvent({ ...newEvent, prizes: e.target.value })
                                                    }
                                                    placeholder="₹50,000 Prize Pool"
                                                />
                                            </div>
                                        </div>

                                        {/* Registration Deadline and Highlights */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">Registration Deadline</Label>
                                                <Input
                                                    type="date"
                                                    value={newEvent.registrationDeadline}
                                                    onChange={(e) =>
                                                        setNewEvent({ ...newEvent, registrationDeadline: e.target.value })
                                                    }
                                                    max={newEvent.date}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">Highlights</Label>
                                                <Input
                                                    value={newEvent.highlights}
                                                    onChange={(e) =>
                                                        setNewEvent({ ...newEvent, highlights: e.target.value })
                                                    }
                                                    placeholder="Free Food, Networking, Certificates"
                                                />
                                                <p className="text-xs text-muted-foreground">Separate with commas</p>
                                            </div>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">Contact Email</Label>
                                                <Input
                                                    type="email"
                                                    value={newEvent.contactEmail}
                                                    onChange={(e) =>
                                                        setNewEvent({ ...newEvent, contactEmail: e.target.value })
                                                    }
                                                    placeholder="events@college.ac.in"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">Contact Phone</Label>
                                                <Input
                                                    value={newEvent.contactPhone}
                                                    onChange={(e) =>
                                                        setNewEvent({ ...newEvent, contactPhone: e.target.value })
                                                    }
                                                    placeholder="+91 9876543210"
                                                />
                                            </div>
                                        </div>

                                        {/* Featured Toggle */}
                                        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    Featured Event
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Featured events are highlighted on the student dashboard
                                                </p>
                                            </div>
                                            <Switch
                                                checked={newEvent.featured}
                                                onCheckedChange={(checked) =>
                                                    setNewEvent({ ...newEvent, featured: checked })
                                                }
                                            />
                                        </div>

                                        {/* Form Actions */}
                                        <div className="flex justify-end gap-3 pt-4 border-t">
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsAddModalOpen(false)}
                                                disabled={isSubmitting}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleAddEvent}
                                                disabled={isSubmitting}
                                                className="min-w-[140px]"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Create Event
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Stats Cards*/}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <CalendarDays className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Events</p>
                                    <p className="text-2xl font-bold">{events.length}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <Star className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Open Events</p>
                                    <p className="text-2xl font-bold">
                                        {events.filter((e) => e.status === "Open").length}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Featured</p>
                                    <p className="text-2xl font-bold">
                                        {events.filter((e) => e.featured).length}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Registrations</p>
                                    <p className="text-2xl font-bold">
                                        {events.reduce((sum, e) => sum + (e.registeredParticipants || 0), 0)}
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
                                    <Input
                                        placeholder="Search events by title, ID, or organizer..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-full md:w-[200px]">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="Technical">Technical</SelectItem>
                                        <SelectItem value="Cultural">Cultural</SelectItem>
                                        <SelectItem value="Sports">Sports</SelectItem>
                                        <SelectItem value="Workshop">Workshop</SelectItem>
                                        <SelectItem value="Seminar">Seminar</SelectItem>
                                        <SelectItem value="Competition">Competition</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
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
                    {loading && events.length === 0 && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                                <p className="text-muted-foreground">Loading events...</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Events List */}
                    {!loading && filteredEvents.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-foreground mb-2">
                                    No events found
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    {events.length === 0
                                        ? "Start by creating your first event."
                                        : "Try adjusting your search or filters."}
                                </p>
                                <Button onClick={() => setIsAddModalOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create First Event
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {filteredEvents.map((event) => (
                                <Card key={event._id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                                    <CalendarDays className="w-8 h-8 text-primary" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-xl font-bold text-foreground">
                                                            {event.title}
                                                        </h3>
                                                        {event.featured && (
                                                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant="outline">{event.event_id}</Badge>
                                                        {getCategoryBadge(event.category)}
                                                        {getStatusBadge(event.status)}
                                                    </div>
                                                    <p className="text-muted-foreground text-sm line-clamp-2">
                                                        {event.description}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            {event.venue}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {formatDate(event.date)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {formatTime(event.date)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-4 h-4" />
                                                            {event.registeredParticipants || 0}
                                                            {event.maxParticipants > 0 && `/${event.maxParticipants}`} registered
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign className="w-4 h-4" />
                                                            {event.entryFee}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        <strong>Organizer:</strong> {event.organizer}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="icon" title="View Details">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" title="Edit Event">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    title="Delete Event"
                                                    onClick={() => handleDeleteEvent(event._id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </AdminLayout>
    );
};

export default AdminEvents;
