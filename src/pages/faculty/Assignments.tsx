import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import FacultySidebar from "@/components/FacultySidebar";
import FacultyTopbar from "@/components/FacultyTopbar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  FileText,
  Calendar,
  Users,
  Loader2,
  X,
} from "lucide-react";
import {
  getFacultyAssignments,
  getAllAssignments,
  createAssignment,
  deleteAssignment,
  getSubmissions,
  downloadSubmission,
  gradeSubmission,
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
  createdBy: string;
  createdByName: string;
  section: string;
  status: "Active" | "Completed" | "Draft";
  submissionCount: number;
  createdAt: string;
};

type Submission = {
  _id: string;
  studentId: string;
  studentName: string;
  fileName: string;
  fileSize: number;
  submittedAt: string;
  grade: number | null;
  feedback: string;
};

const FacultyAssignments = () => {
  const { userData } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmissionsDialogOpen, setIsSubmissionsDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state for create assignment
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    courseCode: "",
    dueDate: "",
    maxMarks: 100,
    year: "2022",
    branch: "CSE",
    section: "B",
  });

  // Fetch assignments - only fetch this faculty's assignments
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const facultyId = userData?.collegeId || "";
      if (!facultyId) {
        toast.error("Faculty ID not found");
        return;
      }
      // Only get assignments created by this faculty
      const data = await getFacultyAssignments(facultyId);
      setAssignments(data);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [userData?.collegeId]);

  // Create assignment handler
  const handleCreateAssignment = async () => {
    if (!formData.title || !formData.course || !formData.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setCreating(true);
      await createAssignment({
        ...formData,
        createdBy: userData?.collegeId || "FACULTY001",
        createdByName: userData?.name || "Faculty",
      });

      toast.success("Assignment created successfully!");
      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        course: "",
        courseCode: "",
        dueDate: "",
        maxMarks: 100,
        year: "2022",
        branch: "CSE",
        section: "B",
      });
      fetchAssignments();
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Failed to create assignment");
    } finally {
      setCreating(false);
    }
  };

  // Delete assignment handler
  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      await deleteAssignment(id);
      toast.success("Assignment deleted");
      fetchAssignments();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast.error("Failed to delete assignment");
    }
  };

  // View submissions handler
  const handleViewSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmissionsDialogOpen(true);
    setSubmissionsLoading(true);

    try {
      const data = await getSubmissions(assignment._id);
      setSubmissions(data.submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Download/View submission PDF
  const handleViewPdf = async (submissionId: string, fileName: string) => {
    if (!selectedAssignment) return;

    try {
      const data = await downloadSubmission(selectedAssignment._id, submissionId);
      openPdfInNewTab(data.fileData, fileName);
    } catch (error) {
      console.error("Error viewing PDF:", error);
      toast.error("Failed to open PDF");
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.status === "Completed") {
      return <Badge className="bg-green-500 text-white">Completed</Badge>;
    }
    if (isOverdue(assignment.dueDate)) {
      return <Badge className="bg-red-500 text-white">Overdue</Badge>;
    }
    return <Badge className="bg-blue-500 text-white">Active</Badge>;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <FacultySidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <FacultyTopbar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              Assignment Management
            </h1>
            <div className="flex flex-col gap-3 w-full md:w-auto md:flex-row md:items-center">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search assignments..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full md:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Assignment
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Assignment</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new assignment for students.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Assignment Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Data Analysis Project"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="course">Course Name *</Label>
                        <Input
                          id="course"
                          placeholder="e.g., Python for EDA"
                          value={formData.course}
                          onChange={(e) =>
                            setFormData({ ...formData, course: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="courseCode">Course Code</Label>
                        <Input
                          id="courseCode"
                          placeholder="e.g., 22CS401"
                          value={formData.courseCode}
                          onChange={(e) =>
                            setFormData({ ...formData, courseCode: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the assignment requirements..."
                        rows={3}
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate">Due Date *</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) =>
                            setFormData({ ...formData, dueDate: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="maxMarks">Max Marks</Label>
                        <Input
                          id="maxMarks"
                          type="number"
                          min={0}
                          max={100}
                          value={formData.maxMarks}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxMarks: parseInt(e.target.value) || 100,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Student Category Selection */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="year">Year *</Label>
                        <Select
                          value={formData.year}
                          onValueChange={(value) =>
                            setFormData({ ...formData, year: value })
                          }
                        >
                          <SelectTrigger id="year">
                            <SelectValue placeholder="Select Year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2022">2022 (4th Year)</SelectItem>
                            <SelectItem value="2023">2023 (3rd Year)</SelectItem>
                            <SelectItem value="2024">2024 (2nd Year)</SelectItem>
                            <SelectItem value="2025">2025 (1st Year)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="branch">Branch *</Label>
                        <Select
                          value={formData.branch}
                          onValueChange={(value) =>
                            setFormData({ ...formData, branch: value })
                          }
                        >
                          <SelectTrigger id="branch">
                            <SelectValue placeholder="Select Branch" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CSE">CSE</SelectItem>
                            <SelectItem value="ECE">ECE</SelectItem>
                            <SelectItem value="EEE">EEE</SelectItem>
                            <SelectItem value="MECH">MECH</SelectItem>
                            <SelectItem value="CIVIL">CIVIL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="section">Section *</Label>
                        <Select
                          value={formData.section}
                          onValueChange={(value) =>
                            setFormData({ ...formData, section: value })
                          }
                        >
                          <SelectTrigger id="section">
                            <SelectValue placeholder="Select Section" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">Section A (01-64)</SelectItem>
                            <SelectItem value="B">Section B (65-C8)</SelectItem>
                            <SelectItem value="C">Section C (C9-12C)</SelectItem>
                            <SelectItem value="D">Section D (12D-190)</SelectItem>
                            <SelectItem value="E">Section E (191-1F4)</SelectItem>
                            <SelectItem value="F">Section F (1F5-258)</SelectItem>
                            <SelectItem value="G">Section G (259-2BC)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAssignment} disabled={creating}>
                      {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create Assignment
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredAssignments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No Assignments Found
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No assignments match your search."
                    : "Click 'Create Assignment' to add your first assignment."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="space-y-1">
                  <div className="grid grid-cols-6 gap-4 p-4 border-b text-sm font-medium text-muted-foreground bg-muted/30">
                    <div>Assignment</div>
                    <div>Due Date</div>
                    <div>Submissions</div>
                    <div>Status</div>
                    <div className="col-span-2">Actions</div>
                  </div>

                  {filteredAssignments.map((assignment) => (
                    <div
                      key={assignment._id}
                      className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-muted/20 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-foreground">
                          {assignment.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {assignment.course}
                        </div>
                      </div>
                      <div className="text-muted-foreground">
                        {formatDate(assignment.dueDate)}
                      </div>
                      <div className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {assignment.submissionCount}
                        </span>{" "}
                        submissions
                      </div>
                      <div>{getStatusBadge(assignment)}</div>
                      <div className="col-span-2 flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewSubmissions(assignment)}
                          title="View Submissions"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => handleDeleteAssignment(assignment._id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Submissions Dialog */}
      <Dialog open={isSubmissionsDialogOpen} onOpenChange={setIsSubmissionsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Submissions - {selectedAssignment?.title}
            </DialogTitle>
            <DialogDescription>
              View and download student submissions for this assignment.
            </DialogDescription>
          </DialogHeader>

          {submissionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No submissions yet.
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div
                  key={sub._id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-muted/20"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {sub.studentName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {sub.studentId}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Submitted: {formatDate(sub.submittedAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground mr-4">
                      {formatFileSize(sub.fileSize)}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewPdf(sub._id, sub.fileName)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View PDF
                    </Button>
                    {sub.grade !== null && (
                      <Badge className="bg-green-500 text-white">
                        Grade: {sub.grade}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacultyAssignments;
