import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FacultySidebar from "@/components/FacultySidebar";
import FacultyTopbar from "@/components/FacultyTopbar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Users,
  BookOpen,
  Plus,
  Trash2,
  Upload,
  FileText,
  X,
  Loader2,
  Sparkles,
  Calendar,
  Clock,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const COURSE_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-amber-500",
];

interface CourseResource {
  _id?: string;
  name: string;
  type: string;
  fileData?: string;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: string;
}

interface SyllabusTopic {
  topic: string;
  duration: string;
}

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  maxStudents: number;
  description: string;
  objectives: string[];
  syllabus: SyllabusTopic[];
  resources: CourseResource[];
  facultyId: string;
  facultyName: string;
  status: string;
  color: string;
  createdAt: string;
}

const FacultyCourses = () => {
  const { userData } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [credits, setCredits] = useState("3");
  const [maxStudents, setMaxStudents] = useState("60");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [syllabus, setSyllabus] = useState<SyllabusTopic[]>([
    { topic: "", duration: "" },
  ]);
  const [pendingFiles, setPendingFiles] = useState<
    { name: string; type: string; fileData: string; fileName: string; fileSize: number }[]
  >([]);
  const [courseColor, setCourseColor] = useState("bg-blue-500");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const facultyId = userData?.collegeId || "";
      const res = await fetch(`${API_BASE}/courses?facultyId=${facultyId}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.collegeId) {
      fetchCourses();
    }
  }, [userData?.collegeId]);

  // Reset form
  const resetForm = () => {
    setCourseCode("");
    setCourseName("");
    setCredits("3");
    setMaxStudents("60");
    setDescription("");
    setObjectives("");
    setSyllabus([{ topic: "", duration: "" }]);
    setPendingFiles([]);
    setCourseColor(COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)]);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const ext = file.name.split(".").pop()?.toUpperCase() || "PDF";
        setPendingFiles((prev) => [
          ...prev,
          {
            name: file.name.replace(/\.[^/.]+$/, ""),
            type: ext,
            fileData: base64,
            fileName: file.name,
            fileSize: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove a pending file
  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Add syllabus topic
  const addSyllabusTopic = () => {
    setSyllabus((prev) => [...prev, { topic: "", duration: "" }]);
  };

  // Remove syllabus topic
  const removeSyllabusTopic = (index: number) => {
    setSyllabus((prev) => prev.filter((_, i) => i !== index));
  };

  // Update syllabus topic
  const updateSyllabusTopic = (index: number, field: "topic" | "duration", value: string) => {
    setSyllabus((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Submit new course
  const handleSubmit = async () => {
    if (!courseCode.trim() || !courseName.trim()) {
      toast.error("Course Code and Course Name are required");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        courseCode: courseCode.trim(),
        courseName: courseName.trim(),
        credits: Number(credits),
        maxStudents: Number(maxStudents),
        description: description.trim(),
        objectives: objectives
          .split("\n")
          .map((o) => o.trim())
          .filter((o) => o.length > 0),
        syllabus: syllabus.filter((s) => s.topic.trim().length > 0),
        resources: pendingFiles,
        facultyId: userData?.collegeId || "",
        facultyName: userData?.name || "Faculty",
        color: courseColor,
      };

      const res = await fetch(`${API_BASE}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Course added successfully!");
        setAddDialogOpen(false);
        resetForm();
        fetchCourses();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add course");
      }
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error("Failed to add course");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete course
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`${API_BASE}/courses/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Course deleted");
        fetchCourses();
        setViewDialogOpen(false);
      } else {
        toast.error("Failed to delete course");
      }
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  // Calculate stats
  const totalStudents = courses.reduce((sum, c) => sum + c.maxStudents, 0);
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  // Filter courses
  const filteredCourses = courses.filter(
    (c) =>
      c.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background">
      <FacultySidebar />

      <div className="flex-1 flex flex-col">
        <FacultyTopbar />

        <main className="flex-1 p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search courses..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* ─── ADD COURSE DIALOG ───────────────────────────────────── */}
            <Dialog open={addDialogOpen} onOpenChange={(open) => {
              setAddDialogOpen(open);
              if (open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Add New Course
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-2">
                  {/* Row 1: Code + Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="courseCode">Course Code *</Label>
                      <Input
                        id="courseCode"
                        placeholder="e.g. CS301"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="courseName">Course Name *</Label>
                      <Input
                        id="courseName"
                        placeholder="e.g. Data Structures"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Row 2: Credits + Students + Color */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="credits">Credits</Label>
                      <Select value={credits} onValueChange={setCredits}>
                        <SelectTrigger id="credits">
                          <SelectValue placeholder="Credits" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((c) => (
                            <SelectItem key={c} value={String(c)}>
                              {c} Credits
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxStudents">Max Students</Label>
                      <Input
                        id="maxStudents"
                        type="number"
                        placeholder="60"
                        value={maxStudents}
                        onChange={(e) => setMaxStudents(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Card Color</Label>
                      <div className="flex gap-1.5 flex-wrap">
                        {COURSE_COLORS.map((color) => (
                          <button
                            key={color}
                            className={`w-7 h-7 rounded-full ${color} border-2 transition-all ${courseColor === color
                              ? "border-white scale-110 ring-2 ring-primary"
                              : "border-transparent opacity-60 hover:opacity-100"
                              }`}
                            onClick={() => setCourseColor(color)}
                            type="button"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Course Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this course covers..."
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Objectives */}
                  <div className="space-y-2">
                    <Label htmlFor="objectives">
                      Course Objectives{" "}
                      <span className="text-xs text-muted-foreground">(one per line)</span>
                    </Label>
                    <Textarea
                      id="objectives"
                      placeholder={"Understand core concepts\nApply practical skills\nBuild projects"}
                      rows={3}
                      value={objectives}
                      onChange={(e) => setObjectives(e.target.value)}
                    />
                  </div>

                  {/* Syllabus */}
                  <div className="space-y-2">
                    <Label>
                      Syllabus Topics{" "}
                      <span className="text-xs text-muted-foreground">(optional)</span>
                    </Label>
                    <div className="space-y-2">
                      {syllabus.map((item, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <Input
                            placeholder="Topic name"
                            value={item.topic}
                            onChange={(e) => updateSyllabusTopic(i, "topic", e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Duration"
                            value={item.duration}
                            onChange={(e) => updateSyllabusTopic(i, "duration", e.target.value)}
                            className="w-28"
                          />
                          {syllabus.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeSyllabusTopic(i)}
                              className="shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addSyllabusTopic}>
                        <Plus className="w-3 h-3 mr-1" /> Add Topic
                      </Button>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>
                      Course Resources{" "}
                      <span className="text-xs text-muted-foreground">(PDFs, Documents)</span>
                    </Label>
                    <div
                      className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload PDFs or documents
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        PDF, DOC, DOCX, PPT, PPTX supported
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    {/* Pending files list */}
                    {pendingFiles.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {pendingFiles.map((file, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" />
                              <span className="text-sm">{file.fileName}</span>
                              <Badge variant="secondary" className="text-xs">
                                {file.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {(file.fileSize / 1024).toFixed(0)} KB
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removePendingFile(i)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Course
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {courses.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Courses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {totalStudents}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {totalCredits}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Credits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Courses Table */}
            <Card>
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                      {searchQuery ? "No courses match your search" : "No courses yet"}
                    </p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      {searchQuery
                        ? "Try a different search term"
                        : 'Click "Add Course" to create your first course'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-6 gap-4 py-2 border-b text-sm font-medium text-muted-foreground">
                      <div>Course Code</div>
                      <div>Course Name</div>
                      <div>Credits</div>
                      <div>Students</div>
                      <div>Status</div>
                      <div>Actions</div>
                    </div>

                    {filteredCourses.map((course) => (
                      <div
                        key={course._id}
                        className="grid grid-cols-6 gap-4 py-3 items-center hover:bg-muted/30 rounded-lg transition-colors"
                      >
                        <div className="font-medium text-foreground">{course.courseCode}</div>
                        <div className="text-foreground truncate">{course.courseName}</div>
                        <div className="text-muted-foreground">{course.credits}</div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{course.maxStudents}</span>
                        </div>
                        <div>
                          <Badge variant={course.status === "Active" ? "default" : "secondary"}>
                            {course.status}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCourse(course);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(course._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ─── VIEW COURSE DETAILS DIALOG ─────────────────────────── */}
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              {selectedCourse && (
                <>
                  <DialogHeader>
                    <DialogTitle>
                      {selectedCourse.courseCode} - {selectedCourse.courseName}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Description */}
                    {selectedCourse.description && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">
                          Course Description
                        </h4>
                        <p className="text-muted-foreground">{selectedCourse.description}</p>
                      </div>
                    )}

                    {/* Objectives */}
                    {selectedCourse.objectives.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">
                          Course Objectives
                        </h4>
                        <ul className="space-y-1">
                          {selectedCourse.objectives.map((obj, i) => (
                            <li key={i} className="text-muted-foreground flex items-start">
                              <span className="mr-2">•</span>
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Syllabus */}
                    {selectedCourse.syllabus.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Course Syllabus</h4>
                        <div className="space-y-2">
                          {selectedCourse.syllabus.map((item, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center p-2 bg-muted/30 rounded"
                            >
                              <span className="text-foreground">{item.topic}</span>
                              {item.duration && (
                                <span className="text-sm text-muted-foreground">
                                  {item.duration}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    {selectedCourse.resources.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">
                          Course Resources
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedCourse.resources.map((resource, i) => (
                            <div
                              key={i}
                              className="flex items-center space-x-2 p-3 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
                              onClick={() => {
                                if (resource.fileData) {
                                  const link = document.createElement("a");
                                  link.href = resource.fileData;
                                  link.download = resource.fileName || resource.name;
                                  link.click();
                                }
                              }}
                            >
                              <FileText className="w-5 h-5 text-primary" />
                              <div>
                                <div className="font-medium text-primary text-sm">
                                  {resource.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {resource.type}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Created{" "}
                        {new Date(selectedCourse.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {selectedCourse.maxStudents} students
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedCourse.credits} credits
                      </span>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default FacultyCourses;
