import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { CalendarDays, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface AcademicEvent {
  _id: string;
  title: string;
  semester: string;
  type: string;
  startDate: string;
  endDate: string;
  color: string;
  tagLabel: string;
}

const SEMESTERS = [
  { value: "1", label: "Semester I" },
  { value: "2", label: "Semester II" },
  { value: "3", label: "Semester III" },
  { value: "4", label: "Semester IV" },
  { value: "5", label: "Semester V" },
  { value: "6", label: "Semester VI" },
  { value: "7", label: "Semester VII" },
  { value: "8", label: "Semester VIII" },
];

const AdminAcademicCalendar = () => {
  const { userData } = useAuth();
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("1");
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    semester: "1",
    type: "Academic",
    startDate: "",
    endDate: "",
    color: "",
    tagLabel: ""
  });

  const fetchEvents = async () => {
    if (!userData?.collegeId) return;
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiBaseUrl}/academic-calendar?collegeId=${userData.collegeId}&semester=${selectedSemester}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error("Failed to load academic calendar");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [userData?.collegeId, selectedSemester]);

  const handleSave = async () => {
    if (!formData.title || !formData.startDate || !formData.endDate || !formData.semester || !formData.type) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const method = editingId ? "PUT" : "POST";
      const url = editingId 
        ? `${apiBaseUrl}/academic-calendar/${editingId}`
        : `${apiBaseUrl}/academic-calendar`;

      // Derive auto-color if not explicitly selected
      const getColorForType = (type: string) => {
        if (type === "Academic") return "bg-green-500";
        if (type === "Exam") return "bg-blue-500";
        if (type === "Holiday") return "bg-yellow-500";
        return "bg-slate-500";
      };

      const finalColor = (!formData.color || formData.color === "none") 
        ? getColorForType(formData.type) 
        : formData.color;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeId: userData?.collegeId,
          ...formData,
          color: finalColor
        })
      });

      if (res.ok) {
        toast.success(editingId ? "Event updated successfully" : "Event created successfully");
        setIsDialogOpen(false);
        setEditingId(null);
        setFormData({ title: "", semester: "1", type: "Academic", startDate: "", endDate: "", color: "", tagLabel: "" });
        fetchEvents();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save event");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiBaseUrl}/academic-calendar/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Event deleted");
        fetchEvents();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const openEdit = (event: AcademicEvent) => {
    setEditingId(event._id);
    setFormData({
      title: event.title,
      semester: event.semester,
      type: event.type,
      startDate: format(new Date(event.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(event.endDate), "yyyy-MM-dd"),
      color: event.color || "",
      tagLabel: event.tagLabel || ""
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: "", semester: selectedSemester, type: "Academic", startDate: "", endDate: "", color: "", tagLabel: "" });
  };

  const formatDateLabel = (start: string, end: string) => {
    const sDate = new Date(start);
    const eDate = new Date(end);
    if (sDate.getTime() === eDate.getTime()) {
      return format(sDate, "dd.MM.yyyy");
    }
    return `${format(sDate, "dd.MM.yyyy")} to ${format(eDate, "dd.MM.yyyy")}`;
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="w-8 h-8 text-primary" />
              Academic Calendar
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage semester-wise academic events, exams, and holidays
            </p>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-48">
                <Label className="sr-only">Filter by Semester</Label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map(sem => (
                      <SelectItem key={sem.value} value={sem.value}>{sem.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="w-full sm:w-auto flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Event" : "Create Event"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input 
                      placeholder="e.g., I Mid Examinations"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Semester</Label>
                      <Select value={formData.semester} onValueChange={(v) => setFormData({ ...formData, semester: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {SEMESTERS.map(sem => (
                            <SelectItem key={sem.value} value={sem.value}>{sem.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Academic">Academic</SelectItem>
                          <SelectItem value="Exam">Exam</SelectItem>
                          <SelectItem value="Holiday">Holiday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input 
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input 
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Color Tag (Optional)</Label>
                      <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Auto (Based on Type)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Auto (Based on Type)</SelectItem>
                          <SelectItem value="bg-green-500">Green</SelectItem>
                          <SelectItem value="bg-blue-500">Blue</SelectItem>
                          <SelectItem value="bg-yellow-500">Yellow</SelectItem>
                          <SelectItem value="bg-red-500">Red</SelectItem>
                          <SelectItem value="bg-purple-500">Purple</SelectItem>
                          <SelectItem value="bg-indigo-500">Indigo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tag Label (Optional)</Label>
                      <Input 
                        placeholder="e.g., 1 Week (Auto if left blank)"
                        value={formData.tagLabel}
                        onChange={(e) => setFormData({ ...formData, tagLabel: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave}>Save Event</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Calendar View */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Academic Calendar - {SEMESTERS.find(s => s.value === selectedSemester)?.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No Academic Events Available</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event._id}
                  className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group relative pr-20"
                >
                  <div
                    className={`w-3 h-3 rounded-full ${event.color}`}
                  ></div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-medium text-foreground truncate">
                      {event.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateLabel(event.startDate, event.endDate)}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0 mr-2">
                    {event.tagLabel}
                  </Badge>
                  
                  {/* Action buttons appear on hover in large screens, or just positioned absolute right */}
                  <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => openEdit(event)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(event._id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAcademicCalendar;
