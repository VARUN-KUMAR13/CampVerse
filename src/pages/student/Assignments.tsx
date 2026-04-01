import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StudentLayout from "@/components/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Calendar,
  Eye,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Loader2,
  Download,
  X,
} from "lucide-react";
import {
  getStudentAssignments,
  submitAssignment,
  getStudentSubmission,
  fileToBase64,
  openPdfInNewTab,
  formatDate,
  formatFileSize,
  isOverdue,
} from "@/services/assignmentService";

type Assignment = {
  _id: string;
  title: string;
  description: string;
  course: string;
  courseCode: string;
  dueDate: string;
  maxMarks: number;
  status: "Active" | "Completed" | "Draft";
  hasSubmitted: boolean;
  submittedAt: string | null;
  grade: number | null;
  feedback: string;
  year?: string;
  degree?: string;
  semester?: string;
};

const StudentAssignments = () => {
  const { userData } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // View modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewAssignment, setViewAssignment] = useState<Assignment | null>(null);

  // ── Compute student's current academic year from collegeId ──
  const getStudentCurrentYear = (): string => {
    const collegeId = userData?.collegeId || "";
    const yearCode = collegeId.substring(0, 2);
    if (!yearCode || !/^\d{2}$/.test(yearCode)) return "IV Year";
    const admissionYear = parseInt("20" + yearCode);
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth(); // 0-indexed
    // Academic year starts in July
    const academicStartYear = curMonth >= 6 ? curYear : curYear - 1;
    const yearNum = academicStartYear - admissionYear + 1;
    const yearLabels = ["I Year", "II Year", "III Year", "IV Year"];
    return yearLabels[Math.min(Math.max(yearNum - 1, 0), 3)];
  };

  // ── Filter State (matching Results page) ──
  const [degree, setDegree] = useState("Major");
  const [year, setYear] = useState(() => getStudentCurrentYear());
  const [semester, setSemester] = useState(() => {
    return userData?.collegeId?.startsWith('22') ? "Semester-II" : "Semester-I";
  });

  // Dynamically configure dropdown defaults mapping exactly to the backend student Current Semester logic
  useEffect(() => {
    if (!userData?.uid) return;
    const fetchProfileSemester = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiBaseUrl}/users/${userData.uid}`);
        if (res.ok) {
          const profile = await res.json();
          let currentSem = profile.academicInformation?.currentSemester || profile.semester;
          
          if (userData?.collegeId?.startsWith('22')) {
            currentSem = "VIII";
          }
          
          if (currentSem) {
            const romanMap: Record<string, { year: string; semLabel: string }> = {
              "I": { year: "I Year", semLabel: "Semester-I" },
              "II": { year: "I Year", semLabel: "Semester-II" },
              "III": { year: "II Year", semLabel: "Semester-I" },
              "IV": { year: "II Year", semLabel: "Semester-II" },
              "V": { year: "III Year", semLabel: "Semester-I" },
              "VI": { year: "III Year", semLabel: "Semester-II" },
              "VII": { year: "IV Year", semLabel: "Semester-I" },
              "VIII": { year: "IV Year", semLabel: "Semester-II" }
            };
            const mapping = romanMap[String(currentSem).toUpperCase()];
            if (mapping) {
              setDegree("Major");
              setYear(mapping.year);
              setSemester(mapping.semLabel);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to initialize course mapping defaults:", err);
      }
    };
    fetchProfileSemester();
  }, [userData?.uid]);

  // Get student name - fallback to collegeId if name not available
  const studentName = userData?.name || userData?.collegeId || "Student";

  // Determine section from roll number
  const getSectionFromRollNumber = (rollNo: string): string => {
    const upperRoll = rollNo.toUpperCase();
    let match = upperRoll.match(/22B81A05([0-9A-F]+)$/);
    if (!match) {
      match = upperRoll.match(/(\d{2})[A-Z].*?([0-9A-F]{2,3})$/);
      if (match) {
        const numPart = parseInt(match[2], 16);
        if (numPart >= 0x01 && numPart <= 0x64) return "A";
        if (numPart >= 0x65 && numPart <= 0xC8) return "B";
        return "B";
      }
      return "B";
    }
    const hexPart = match[1];
    const numPart = parseInt(hexPart, 16);
    if (numPart >= 0x01 && numPart <= 0x64) return "A";
    if (numPart >= 0x65 && numPart <= 0xC8) return "B";
    if (numPart >= 0xC9 && numPart <= 0x12C) return "C";
    if (numPart >= 0x12D && numPart <= 0x190) return "D";
    if (numPart >= 0x191 && numPart <= 0x1F4) return "E";
    if (numPart >= 0x1F5 && numPart <= 0x258) return "F";
    if (numPart >= 0x259 && numPart <= 0x2BC) return "G";
    return "B";
  };

  // Fetch assignments for the student based on their section + filters
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const studentId = userData?.collegeId || "";
      if (!studentId) {
        toast.error("Student ID not found");
        return;
      }

      const section = getSectionFromRollNumber(studentId);
      const data = await getStudentAssignments(section, studentId, {
        degree,
        semester,
        year,
      });
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.collegeId) {
      fetchAssignments();
    }
  }, [userData?.collegeId, degree, year, semester]);

  // All filtering is done server-side (degree + year + semester + section)
  const filteredAssignments = assignments;

  // Handle file selection and upload
  const handleFileSelection = async (
    assignmentId: string,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF only)
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      event.target.value = "";
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      event.target.value = "";
      return;
    }

    try {
      setUploading(assignmentId);

      // Convert file to base64
      const base64Data = await fileToBase64(file);

      // Submit to backend
      await submitAssignment(assignmentId, {
        studentId: userData?.collegeId || "",
        studentName: studentName,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: base64Data,
      });

      toast.success("Assignment submitted successfully!", {
        description: `File: ${file.name}`,
      });

      // Refresh assignments to update status
      fetchAssignments();
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error("Failed to submit assignment");
    } finally {
      setUploading(null);
      event.target.value = "";
    }
  };

  // View own submission
  const handleViewSubmission = async (assignmentId: string, title: string) => {
    try {
      setViewingSubmission(assignmentId);
      const studentId = userData?.collegeId || "";
      const submission = await getStudentSubmission(assignmentId, studentId);

      if (submission && submission.fileData) {
        openPdfInNewTab(submission.fileData, submission.fileName);
      } else {
        toast.error("No submission found");
      }
    } catch (error) {
      console.error("Error viewing submission:", error);
      toast.error("Failed to view submission");
    } finally {
      setViewingSubmission(null);
    }
  };

  // Get status badge component
  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.hasSubmitted) {
      if (assignment.grade !== null) {
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Graded: {assignment.grade}/{assignment.maxMarks}
          </Badge>
        );
      }
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Submitted
        </Badge>
      );
    }
    if (isOverdue(assignment.dueDate)) {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          <AlertCircle className="w-3 h-3 mr-1" />
          Overdue
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-8 h-8 text-primary" />
              Assignments
            </h1>
            <p className="text-muted-foreground mt-1">
              Submit your assignments and track your progress
            </p>
          </div>
        </div>

        {/* Top Filters — matching /student/results exactly */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select name="degree" value={degree} onValueChange={setDegree}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Degree" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Major">Major</SelectItem>
              <SelectItem value="Minor">Minor</SelectItem>
            </SelectContent>
          </Select>

          <Select name="year" value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="I Year">I Year</SelectItem>
              <SelectItem value="II Year">II Year</SelectItem>
              <SelectItem value="III Year">III Year</SelectItem>
              <SelectItem value="IV Year">IV Year</SelectItem>
            </SelectContent>
          </Select>

          <Select name="semester" value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semester-I">Semester-I</SelectItem>
              <SelectItem value="Semester-II">Semester-II</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredAssignments.length === 0 ? (
          <Card className="border shadow-none bg-card/50">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Assignments Found</h3>
              <p className="text-muted-foreground text-sm">
                No assignments match your selected Degree, Year, and Semester combination.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <Card
                key={assignment._id}
                className="hover:shadow-md transition-shadow border-border/50"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    {/* Assignment Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {assignment.title}
                        </h3>
                        {getStatusBadge(assignment)}
                      </div>

                      <p className="text-sm text-primary mb-3">
                        {assignment.course}
                        {assignment.courseCode && ` (${assignment.courseCode})`}
                      </p>

                      <p className="text-sm text-muted-foreground mb-4">
                        {assignment.description || "No description provided."}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {formatDate(assignment.dueDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>Max Marks: {assignment.maxMarks}</span>
                        </div>
                        {assignment.hasSubmitted && assignment.submittedAt && (
                          <div className="flex items-center gap-1 text-green-500">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Submitted: {formatDate(assignment.submittedAt)}</span>
                          </div>
                        )}
                      </div>

                      {/* Feedback */}
                      {assignment.feedback && (
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm font-medium text-foreground mb-1">
                            Faculty Feedback:
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.feedback}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-stretch space-y-2 md:w-48">
                      {/* Hidden file input */}
                      <input
                        ref={(el) => (fileInputRefs.current[assignment._id] = el)}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => handleFileSelection(assignment._id, e)}
                      />

                      {/* View Button — opens description modal */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setViewAssignment(assignment);
                          setViewModalOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>

                      {/* Submit/Resubmit Button */}
                      <Button
                        size="sm"
                        onClick={() => fileInputRefs.current[assignment._id]?.click()}
                        disabled={uploading === assignment._id}
                        className={
                          assignment.hasSubmitted
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-primary hover:bg-primary/90"
                        }
                      >
                        {uploading === assignment._id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            {assignment.hasSubmitted ? "Resubmit" : "Submit PDF"}
                          </>
                        )}
                      </Button>

                      {/* View Submission Button (if submitted) */}
                      {assignment.hasSubmitted && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleViewSubmission(assignment._id, assignment.title)
                          }
                          disabled={viewingSubmission === assignment._id}
                        >
                          {viewingSubmission === assignment._id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              View My Submission
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* View Assignment Modal */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {viewAssignment?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-2 text-sm text-primary">
                <FileText className="w-4 h-4" />
                {viewAssignment?.course}
                {viewAssignment?.courseCode && ` (${viewAssignment.courseCode})`}
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <h4 className="text-sm font-medium text-foreground mb-2">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {viewAssignment?.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {viewAssignment?.dueDate ? formatDate(viewAssignment.dueDate) : '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>Max Marks: {viewAssignment?.maxMarks}</span>
                </div>
              </div>

              {viewAssignment?.feedback && (
                <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Faculty Feedback:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {viewAssignment.feedback}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </StudentLayout>
  );
};

export default StudentAssignments;
