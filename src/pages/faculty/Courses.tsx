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
import FacultyLayout from "@/components/FacultyLayout";
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
  Calendar,
  Clock,
  Edit2,
  CheckSquare,
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

const ALL_SECTIONS = ["A", "B", "C", "D", "E", "F", "G"];

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
  department: string;
  degree?: string;
  classType?: string;
  year: string;
  semester: string;
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
  sections?: string[];
  assignedStudents?: string[];
}

interface StudentInfo {
  rollNumber: string;
  name: string;
  section: string;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);

  // Form state
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [department, setDepartment] = useState("CSE");
  const [degree, setDegree] = useState("Major");
  const [classType, setClassType] = useState("Theory");
  const [year, setYear] = useState("IV Year");
  const [semester, setSemester] = useState("Semester I");
  const [credits, setCredits] = useState("3");
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

  // Sections & Students state
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [sectionStudents, setSectionStudents] = useState<StudentInfo[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);

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

  // Fetch students when sections change
  useEffect(() => {
    if (selectedSections.length === 0) {
      setSectionStudents([]);
      return;
    }

    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const allStudents: StudentInfo[] = [];
        const yearCode = userData?.year || "22";
        const branchCode = userData?.branch || "05";

        for (const section of selectedSections) {
          try {
            const res = await fetch(
              `${API_BASE}/students/section/${yearCode}/${branchCode}/${section}`
            );
            if (res.ok) {
              const data = await res.json();
              if (data.students) {
                data.students.forEach((s: any) => {
                  if (!allStudents.some((existing) => existing.rollNumber === s.rollNumber)) {
                    allStudents.push({
                      rollNumber: s.rollNumber,
                      name: s.name || s.rollNumber,
                      section: s.section || section,
                    });
                  }
                });
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch students for section ${section}:`, err);
          }
        }

        setSectionStudents(allStudents.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber)));
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedSections, userData?.year, userData?.branch]);

  // Toggle section selection
  const toggleSection = (section: string) => {
    setSelectedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  // Toggle student selection
  const toggleStudent = (rollNumber: string) => {
    setSelectedStudents((prev) =>
      prev.includes(rollNumber)
        ? prev.filter((r) => r !== rollNumber)
        : [...prev, rollNumber]
    );
  };

  // Select/Deselect all filtered students
  const toggleAllFilteredStudents = () => {
    const filtered = filteredStudents.map((s) => s.rollNumber);
    const allSelected = filtered.every((r) => selectedStudents.includes(r));
    if (allSelected) {
      setSelectedStudents((prev) => prev.filter((r) => !filtered.includes(r)));
    } else {
      setSelectedStudents((prev) => [...new Set([...prev, ...filtered])]);
    }
  };

  // Filter students for search (restricted to Section B only dynamically)
  const isOnlySectionB = selectedSections.length > 0 && selectedSections.every(s => s === "B");
  const filteredStudents = isOnlySectionB
    ? sectionStudents.filter(
        (s) =>
          s.rollNumber.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(studentSearchQuery.toLowerCase())
      )
    : [];

  // Reset form
  const resetForm = () => {
    setIsEditing(false);
    setEditCourseId(null);
    setCourseCode("");
    setCourseName("");
    setDepartment("CSE");
    setDegree("Major");
    setClassType("Theory");
    setYear("IV Year");
    setSemester("Semester I");
    setCredits("3");
    setDescription("");
    setObjectives("");
    setSyllabus([{ topic: "", duration: "" }]);
    setPendingFiles([]);
    setCourseColor(COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)]);
    setSelectedSections([]);
    setSelectedStudents([]);
    setSectionStudents([]);
    setStudentSearchQuery("");
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
      const payload: any = {
        courseCode: courseCode.trim(),
        courseName: courseName.trim(),
        department: department,
        degree: degree,
        classType: classType,
        year: year,
        semester: semester,
        credits: Number(credits) || 3,
        maxStudents: selectedStudents.length || 0,
        description: description.trim(),
        objectives: objectives
          .split("\n")
          .map((o) => o.trim())
          .filter((o) => o.length > 0),
        syllabus: syllabus.filter((s) => s.topic.trim().length > 0),
        facultyId: userData?.collegeId || "",
        facultyName: userData?.name || "Faculty",
        color: courseColor,
        sections: selectedSections,
        assignedStudents: selectedStudents,
      };

      let url = `${API_BASE}/courses`;
      let method = "POST";

      if (isEditing && editCourseId) {
        url = `${API_BASE}/courses/${editCourseId}`;
        method = "PUT";
      } else {
        payload.resources = pendingFiles;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (isEditing && editCourseId && pendingFiles.length > 0) {
          for (const file of pendingFiles) {
            await fetch(`${API_BASE}/courses/${editCourseId}/resources`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(file),
            });
          }
        }

        toast.success(isEditing ? "Course updated successfully!" : "Course added successfully!");
        setAddDialogOpen(false);
        resetForm();
        fetchCourses();
      } else {
        const err = await res.json();
        toast.error(err.error || (isEditing ? "Failed to update course" : "Failed to add course"));
      }
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error(isEditing ? "Failed to update course" : "Failed to add course");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (course: Course) => {
    setIsEditing(true);
    setEditCourseId(course._id);
    setCourseCode(course.courseCode);
    setCourseName(course.courseName);
    setDepartment(course.department || "CSE");
    setDegree(course.degree || "Major");
    setClassType(course.classType || "Theory");
    setYear(course.year || "IV Year");
    setSemester(course.semester || "Semester I");
    setCredits(String(course.credits));
    setDescription(course.description || "");
    setObjectives((course.objectives || []).join("\n"));
    setSyllabus(course.syllabus?.length > 0 ? course.syllabus : [{ topic: "", duration: "" }]);
    setCourseColor(course.color || COURSE_COLORS[0]);
    setPendingFiles([]);
    setSelectedSections(course.sections || []);
    setSelectedStudents(course.assignedStudents || []);
    setAddDialogOpen(true);
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

  // Download a resource
  const handleDownload = async (courseId: string, resource: CourseResource) => {
    try {
      if (!resource._id) {
        if (resource.fileData) {
          const link = document.createElement("a");
          link.href = resource.fileData;
          link.download = resource.fileName || resource.name;
          link.click();
        }
        return;
      }

      const res = await fetch(`${API_BASE}/courses/${courseId}/resources/${resource._id}/download`);
      if (res.ok) {
        const data = await res.json();
        const link = document.createElement("a");
        link.href = data.fileData;
        link.download = data.fileName || data.name || resource.name;
        link.click();
      } else {
        toast.error("Failed to download resource");
      }
    } catch (error) {
      console.error("Error downloading resource:", error);
      toast.error("Error downloading resource");
    }
  };

  // Calculate stats
  const totalStudents = courses.reduce((sum, c) => sum + (c.assignedStudents?.length || c.maxStudents || 0), 0);
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  // Filter courses
  const filteredCourses = courses.filter(
    (c) =>
      c.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <FacultyLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              My Courses
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize your teaching workflow and course responsibilities.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                  <BookOpen className="w-5 h-5 text-primary" />
                  {isEditing ? "Edit Course" : "Add New Course"}
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

                {/* Row 1.5: Department, Degree, Year, Semester */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {["CSE", "CSE (AI & ML)", "CSE (Data Science)", "ECE", "EEE", "Mechanical", "Civil", "IT"].map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="degree">Degree *</Label>
                    <Select value={degree} onValueChange={setDegree}>
                      <SelectTrigger id="degree">
                        <SelectValue placeholder="Select Degree" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Major", "Minor"].map((deg) => (
                          <SelectItem key={deg} value={deg}>{deg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {["I Year", "II Year", "III Year", "IV Year"].map((y) => (
                          <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester *</Label>
                    <Select value={semester} onValueChange={setSemester}>
                      <SelectTrigger id="semester">
                        <SelectValue placeholder="Select Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Semester I", "Semester II"].map((sem) => (
                          <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Class Type, Credits, Color */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="classType">Class Type *</Label>
                    <Select value={classType} onValueChange={setClassType}>
                      <SelectTrigger id="classType">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Theory", "Lab"].map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credits">Credits</Label>
                    <Input
                      id="credits"
                      type="number"
                      min="1"
                      max="10"
                      placeholder="e.g. 3"
                      value={credits}
                      onChange={(e) => setCredits(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Card Color</Label>
                    <div className="flex gap-1.5 flex-wrap mt-1">
                      {[...new Set(COURSE_COLORS)].map((color) => (
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

                {/* ─── SECTIONS DROPDOWN ──────────────────────────────── */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    Assign Sections
                    <span className="text-xs text-muted-foreground font-normal ml-1">(select one or more)</span>
                  </Label>
                  <Select
                    key={selectedSections.join(",")}
                    onValueChange={(value) => {
                      if (!selectedSections.includes(value)) {
                        setSelectedSections((prev) => [...prev, value]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedSections.length > 0 ? `${selectedSections.length} section(s) selected` : "Select sections..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_SECTIONS.map((section) => {
                        const isSelected = selectedSections.includes(section);
                        return (
                          <SelectItem
                            key={section}
                            value={section}
                            disabled={isSelected}
                            className={isSelected ? "opacity-50" : ""}
                          >
                            <span className="flex items-center gap-2">
                              {isSelected && (
                                <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                              Section {section}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {selectedSections.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedSections.sort().map((s) => (
                        <Badge
                          key={s}
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/20 text-xs gap-1 px-3 py-1"
                        >
                          Section {s}
                          <button
                            type="button"
                            onClick={() => toggleSection(s)}
                            className="hover:text-red-500 transition-colors ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* ─── STUDENTS ASSIGNMENT ───────────────────────────── */}
                {selectedSections.length > 0 && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-muted-foreground" />
                      Assign Students
                      <span className="text-xs text-muted-foreground font-normal ml-1">
                        ({selectedStudents.length} selected)
                      </span>
                    </Label>

                    {/* Search + Select All */}
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                        <Input
                          placeholder="Search by name or roll number..."
                          className="pl-9 h-9 text-sm"
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={toggleAllFilteredStudents}
                        className="shrink-0 text-xs h-9"
                      >
                        {filteredStudents.length > 0 &&
                         filteredStudents.every((s) => selectedStudents.includes(s.rollNumber))
                          ? "Deselect All"
                          : "Select All"}
                      </Button>
                    </div>

                    {/* Students list */}
                    <div className="border border-border/50 rounded-lg max-h-48 overflow-y-auto bg-muted/10">
                      {loadingStudents ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground">Loading students...</span>
                        </div>
                      ) : filteredStudents.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          {sectionStudents.length === 0
                            ? "No students found in selected sections"
                            : "No students match your search"}
                        </div>
                      ) : (
                        <div className="divide-y divide-border/30">
                          {filteredStudents.map((student) => {
                            const isChecked = selectedStudents.includes(student.rollNumber);
                            return (
                              <button
                                key={student.rollNumber}
                                type="button"
                                onClick={() => toggleStudent(student.rollNumber)}
                                className={`
                                  w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all text-sm
                                  ${isChecked
                                    ? "bg-primary/5 hover:bg-primary/10"
                                    : "hover:bg-muted/30"
                                  }
                                `}
                              >
                                <div
                                  className={`
                                    w-4.5 h-4.5 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-all
                                    ${isChecked
                                      ? "bg-primary border-primary"
                                      : "border-border"
                                    }
                                  `}
                                >
                                  {isChecked && (
                                    <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-foreground truncate block">
                                    {student.name !== student.rollNumber ? student.name : student.rollNumber}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground font-mono shrink-0">
                                  {student.rollNumber}
                                </span>
                                <Badge variant="outline" className="text-[10px] h-5 shrink-0">
                                  Sec {student.section}
                                </Badge>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                      {isEditing ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      {isEditing ? <Edit2 className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      {isEditing ? "Update Course" : "Add Course"}
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

          </div>

          {/* Courses Grid */}
          <div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <Card
                      key={course._id}
                      className="overflow-hidden border-border/50 bg-card/50 hover:bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col group relative"
                    >
                      {/* Top colored section with course code */}
                      <div className={`m-3 h-[100px] rounded-xl flex items-center justify-center ${course.color || "bg-blue-500"} shadow-inner`}>
                         <h3 className="font-bold text-white text-2xl tracking-wider uppercase">{course.courseCode}</h3>
                      </div>
                      
                      <CardContent className="px-5 pb-5 pt-2 flex flex-col flex-1">
                        <div className="flex justify-between items-start gap-2 mb-4">
                          <div>
                            <h3 className="font-semibold text-lg text-foreground line-clamp-1" title={course.courseName}>{course.courseName}</h3>
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                               <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                               </svg>
                               {course.facultyName || "Faculty"}
                            </p>
                          </div>
                          <Badge className="bg-green-500 hover:bg-green-600 text-white border-none shrink-0 cursor-default uppercase tracking-wider text-[10px] shadow-sm px-2 py-0.5" title="Active Course">
                            Active
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 my-2 mb-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{course.credits}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Credits</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{course.assignedStudents?.length || course.maxStudents || 0}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Students</p>
                          </div>
                        </div>
                        
                        {/* Action Icons */}
                        <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-border/50">
                           <Button 
                              variant="ghost" 
                              className="w-full h-10 bg-transparent hover:bg-primary/20 text-white hover:text-primary-foreground transition-all duration-300" 
                              title="View Details"
                              onClick={() => { setSelectedCourse(course); setViewDialogOpen(true); }}
                           >
                             <Eye className="w-5 h-5" />
                           </Button>
                           <Button 
                              variant="ghost" 
                              className="w-full h-10 bg-transparent hover:bg-blue-500/20 text-white hover:text-blue-100 transition-all duration-300"
                              title="Edit Course"
                              onClick={() => handleEdit(course)}
                           >
                             <Edit2 className="w-5 h-5" />
                           </Button>
                           <Button 
                              variant="ghost" 
                              className="w-full h-10 bg-transparent hover:bg-red-500/20 text-white hover:text-red-100 transition-all duration-300"
                              title="Delete Course"
                              onClick={() => handleDelete(course._id)}
                           >
                             <Trash2 className="w-5 h-5" />
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
          </div>
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

                  {/* Sections & Students */}
                  {(selectedCourse.sections?.length || 0) > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Assigned Sections</h4>
                      <div className="flex gap-2 flex-wrap">
                        {selectedCourse.sections?.map((s) => (
                          <Badge key={s} className="bg-primary/10 text-primary border-primary/20">
                            Section {s}
                          </Badge>
                        ))}
                      </div>
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
                            onClick={() => handleDownload(selectedCourse._id, resource)}
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
                      {selectedCourse.assignedStudents?.length || selectedCourse.maxStudents} students
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
      </div>
    </FacultyLayout>
  );
};

export default FacultyCourses;
