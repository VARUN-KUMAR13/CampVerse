import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Megaphone, Plus, Trash2, Calendar as CalendarIcon, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  priority: "Important" | "Normal" | "Low";
  audience: "Students" | "Faculty" | "Both";
  createdBy: string;
  createdAt: string;
  expiryDate: string | null;
  image?: string;
}

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"Important" | "Normal" | "Low">("Important");
  const [audience, setAudience] = useState<"Students" | "Faculty" | "Both">("Both");
  const [expiryDate, setExpiryDate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/announcements`);
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setPriority("Important");
    setAudience("Both");
    setExpiryDate("");
    setImageFile(null);
    setImagePreviewUrl("");
    setUploadProgress(0);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required.");
      return;
    }

    try {
      setSubmitting(true);
      let imageBase64 = "";

      if (imageFile) {
        // Validate file size (max 5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
          toast.error("Image must be smaller than 5MB.");
          setSubmitting(false);
          return;
        }
        // Convert to base64 data URL
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Failed to read image file."));
          reader.readAsDataURL(imageFile);
        });
      }

      const payload = {
        title: title.trim(),
        message: message.trim(),
        priority,
        audience,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
        image: imageBase64 || undefined,
      };

      const res = await fetch(`${API_BASE}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Announcement published successfully!");
        setAddDialogOpen(false);
        resetForm();
        fetchAnnouncements();
      } else {
        toast.error("Failed to publish announcement.");
      }
    } catch (error) {
      console.error("Failed to post announcement:", error);
      toast.error("Failed to publish announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const res = await fetch(`${API_BASE}/announcements/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Announcement deleted successfully");
        fetchAnnouncements();
      } else {
        toast.error("Failed to delete announcement.");
      }
    } catch (error) {
      toast.error("Failed to delete announcement.");
    }
  };

  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Megaphone className="w-8 h-8 text-primary" />
              Announcements Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Publish official announcements to Student and Faculty dashboards.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search announcements..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={addDialogOpen} onOpenChange={(open) => {
            setAddDialogOpen(open);
            if (open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Publish Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-primary" />
                  New Announcement
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="e.g. Mid Semester Examination Schedule"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message *</Label>
                  <Textarea
                    placeholder="Enter the announcement message..."
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select value={audience} onValueChange={(val: any) => setAudience(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Both">Both (Students & Faculty)</SelectItem>
                        <SelectItem value="Students">Students Only</SelectItem>
                        <SelectItem value="Faculty">Faculty Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Important">Important</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Expiry Date (Optional)</Label>
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty if this announcement shouldn't expire automatically.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Image Upload (Optional)</Label>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {imagePreviewUrl && (
                    <div className="relative mt-2 rounded-lg overflow-hidden border border-border/50 max-h-48 group">
                      <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-scale-down bg-black/20" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreviewUrl("");
                          setUploadProgress(0);
                        }}
                      >
                         <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                     <div className="w-full bg-secondary h-1.5 rounded-full mt-2 overflow-hidden">
                       <div className="bg-primary h-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                     </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Publish
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Published Announcements</CardTitle>
            <CardDescription>Manage and view all platform announcements.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No announcements found</p>
                <p className="text-sm text-muted-foreground/60">Upload your first announcement to reach users.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAnnouncements.map((ann) => {
                  const isExpired = ann.expiryDate && new Date(ann.expiryDate) < new Date();
                  
                  return (
                  <div key={ann._id} className="p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/20 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-lg text-foreground">{ann.title}</h3>
                          {ann.priority === "Important" && (
                            <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">Important</Badge>
                          )}
                          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                            {ann.audience}
                          </Badge>
                          {isExpired && (
                            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">Expired</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{ann.message}</p>
                        {ann.image && (
                          <div className="mt-4 rounded-xl overflow-hidden border border-border/50 bg-black/20 w-full sm:w-[80%]">
                            <img 
                              src={ann.image} 
                              alt={ann.title} 
                              className="w-full max-h-[400px] object-contain cursor-pointer hover:opacity-90 transition-opacity" 
                              loading="lazy" 
                              onClick={() => window.open(ann.image, '_blank')}
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4 pt-2 border-t border-border/50">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            Posted {format(new Date(ann.createdAt), "MMM d, yyyy")}
                          </span>
                          <span className="flex items-center gap-1 text-primary">
                            By {ann.createdBy}
                          </span>
                          {ann.expiryDate && (
                            <span className="flex items-center gap-1 text-orange-500/80">
                              Expires {format(new Date(ann.expiryDate), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => handleDelete(ann._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
