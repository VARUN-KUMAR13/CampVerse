import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
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
};

const StudentAssignments = () => {
  const { userData } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Get student name - fallback to collegeId if name not available
  const studentName = userData?.name || userData?.collegeId || "Student";

  // Determine section from roll number
  // CSE 4th Year (2022 batch): 22B81A05XX where XX is in hex
  // Sections: A=01-64, B=65-C8, C=C9-12C (if 3 chars), etc.
  // Each section ~100 students in decimal (64 in hex)
  const getSectionFromRollNumber = (rollNo: string): string => {
    // Extract the last 2-3 characters (hex part after 22B81A05)
    const upperRoll = rollNo.toUpperCase();

    // Try to match 22B81A05XX or 22B81A05XXX pattern
    let match = upperRoll.match(/22B81A05([0-9A-F]+)$/);
    if (!match) {
      // Try without the branch code for other formats
      match = upperRoll.match(/(\d{2})[A-Z].*?([0-9A-F]{2,3})$/);
      if (match) {
        const numPart = parseInt(match[2], 16);
        // Simple section calculation
        if (numPart >= 0x01 && numPart <= 0x64) return "A";
        if (numPart >= 0x65 && numPart <= 0xC8) return "B";
        return "B"; // Default
      }
      return "B"; // Default to B
    }

    const hexPart = match[1];
    const numPart = parseInt(hexPart, 16); // Parse as hex

    // Section ranges based on roll number pattern:
    // 22B81A0501-22B81A0564 = CSE-A (hex 01-64 = decimal 1-100)
    // 22B81A0565-22B81A05C8 = CSE-B (hex 65-C8 = decimal 101-200)
    // and so on...
    if (numPart >= 0x01 && numPart <= 0x64) return "A";   // 1-100
    if (numPart >= 0x65 && numPart <= 0xC8) return "B";   // 101-200
    if (numPart >= 0xC9 && numPart <= 0x12C) return "C";  // 201-300
    if (numPart >= 0x12D && numPart <= 0x190) return "D"; // 301-400
    if (numPart >= 0x191 && numPart <= 0x1F4) return "E"; // 401-500
    if (numPart >= 0x1F5 && numPart <= 0x258) return "F"; // 501-600
    if (numPart >= 0x259 && numPart <= 0x2BC) return "G"; // 601-700

    return "B"; // Default fallback
  };

  // Fetch assignments for the student based on their section
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const studentId = userData?.collegeId || "";
      if (!studentId) {
        toast.error("Student ID not found");
        return;
      }

      // Determine section from roll number
      const section = getSectionFromRollNumber(studentId);
      console.log(`[Assignments] Student ${studentId} belongs to Section ${section}`);

      const data = await getStudentAssignments(section, studentId);
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
  }, [userData?.collegeId]);

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

      console.log("[Assignment] Submitting:", {
        assignmentId,
        studentId: userData?.collegeId,
        studentName,
        fileName: file.name,
        fileSize: file.size,
      });

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
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentTopbar studentId={userData?.collegeId || ""} />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">My Assignments</h1>
            <p className="text-muted-foreground mt-1">
              Submit your assignments and track your progress
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : assignments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No Assignments Yet
                </h3>
                <p className="text-muted-foreground">
                  You don't have any assignments assigned to you yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
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
        </main>
      </div>
    </div>
  );
};

export default StudentAssignments;
