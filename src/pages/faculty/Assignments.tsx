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
import FacultyLayout from "@/components/FacultyLayout";
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
  ClipboardList,
} from "lucide-react";
import {
  getFacultyAssignments,
  getAllAssignments,
  createAssignment,
  updateAssignment,
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

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    course: "",
    courseCode: "",
    dueDate: "",
    status: "Active" as "Active" | "Completed" | "Draft",
  });
  const [updating, setUpdating] = useState(false);

  // Form state for create assignment
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    courseCode: "",
    dueDate: "",
    maxMarks: 100,
    degree: "Major",
    year: "IV Year",
    semester: "Semester-I",
    branch: "CSE",
    section: "",
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
    if (!formData.title || !formData.course || !formData.dueDate || !formData.section) {
      toast.error("Please fill in all required fields (including Section)");
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
        degree: "Major",
        year: "IV Year",
        semester: "Semester-I",
        branch: "CSE",
        section: "",
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

  // Edit assignment handler
  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setEditFormData({
      title: assignment.title,
      description: assignment.description || "",
      course: assignment.course,
      courseCode: assignment.courseCode || "",
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : "",
      status: assignment.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateAssignment = async () => {
    if (!editingAssignment) return;
    if (!editFormData.title || !editFormData.course || !editFormData.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setUpdating(true);
      await updateAssignment(editingAssignment._id, editFormData);
      toast.success("Assignment updated successfully!");
      setIsEditDialogOpen(false);
      setEditingAssignment(null);
      fetchAssignments();
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast.error("Failed to update assignment");
    } finally {
      setUpdating(false);
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
    const baseClasses = "text-white border-none shrink-0 cursor-default uppercase tracking-wider text-[10px] shadow-sm px-2 py-0.5";
    if (assignment.status === "Completed") {
      return <Badge className={`bg-green-500 hover:bg-green-600 ${baseClasses}`}>Completed</Badge>;
    }
    if (isOverdue(assignment.dueDate)) {
      return <Badge className={`bg-red-500 hover:bg-red-600 ${baseClasses}`}>Overdue</Badge>;
    }
    return <Badge className={`bg-blue-500 hover:bg-blue-600 ${baseClasses}`}>Active</Badge>;
  };

  return (
    <FacultyLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="w-8 h-8 text-primary" />
              Assignment Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Streamline assignment distribution and evaluate student performance.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                {/* Row 1: Degree + Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="degree">Degree *</Label>
                    <Select
                      value={formData.degree}
                      onValueChange={(value) =>
                        setFormData({ ...formData, degree: value })
                      }
                    >
                      <SelectTrigger id="degree">
                        <SelectValue placeholder="Select Degree" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Major">Major</SelectItem>
                        <SelectItem value="Minor">Minor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                        <SelectItem value="I Year">I Year</SelectItem>
                        <SelectItem value="II Year">II Year</SelectItem>
                        <SelectItem value="III Year">III Year</SelectItem>
                        <SelectItem value="IV Year">IV Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Semester + Branch */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="semester">Semester *</Label>
                    <Select
                      value={formData.semester}
                      onValueChange={(value) =>
                        setFormData({ ...formData, semester: value })
                      }
                    >
                      <SelectTrigger id="semester">
                        <SelectValue placeholder="Select Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Semester-I">Semester-I</SelectItem>
                        <SelectItem value="Semester-II">Semester-II</SelectItem>
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
                </div>

                {/* Row 3: Section (full width text input) */}
                <div className="grid gap-2">
                  <Label htmlFor="section">Section *</Label>
                  <Input
                    id="section"
                    placeholder="e.g., B"
                    value={formData.section}
                    onChange={(e) =>
                      setFormData({ ...formData, section: e.target.value.trim() })
                    }
                  />
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

        {/* Edit Assignment Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-primary" />
                Edit Assignment
              </DialogTitle>
              <DialogDescription>
                Update the assignment details below.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  placeholder="Assignment Title"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Assignment description..."
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Course *</Label>
                  <Input
                    placeholder="Course Name"
                    value={editFormData.course}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, course: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Course Code</Label>
                  <Input
                    placeholder="e.g. CS401"
                    value={editFormData.courseCode}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, courseCode: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date *</Label>
                  <Input
                    type="date"
                    value={editFormData.dueDate}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, dueDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(val: any) =>
                      setEditFormData({ ...editFormData, status: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateAssignment} disabled={updating}>
                {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment) => (
              <Card
                key={assignment._id}
                className="overflow-hidden border-border/50 bg-card/50 hover:bg-card transition-all duration-300 flex flex-col group relative"
              >
                {/* Top colored section with assignment title */}
                <div className={`m-3 h-[100px] rounded-xl flex flex-col items-center justify-center bg-blue-500 px-4 text-center`}>
                   <h3 className="font-bold text-white text-lg tracking-wide line-clamp-2" title={assignment.title}>{assignment.title}</h3>
                </div>
                
                <CardContent className="px-5 pb-5 pt-2 flex flex-col flex-1">
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground flex items-center">
                         <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary" />
                         Due: {formatDate(assignment.dueDate)}
                      </p>
                    </div>
                    {getStatusBadge(assignment)}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 my-2 mb-6">
                    <div className="text-center bg-muted/20 py-3 rounded-lg border border-border/50">
                      <p className="text-2xl font-bold text-foreground">{assignment.submissionCount}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Submissions</p>
                    </div>
                  </div>
                  
                  {/* Action Icons */}
                  <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-border/50">
                     <Button 
                        variant="ghost" 
                        className="w-full h-10 bg-transparent hover:bg-primary/20 text-white hover:text-primary-foreground transition-all duration-300"
                        title="View Submissions"
                        onClick={() => handleViewSubmissions(assignment)}
                     >
                       <Eye className="w-5 h-5" />
                     </Button>
                     <Button 
                        variant="ghost" 
                        className="w-full h-10 bg-transparent hover:bg-blue-500/20 text-white hover:text-blue-100 transition-all duration-300"
                        title="Edit Assignment"
                        onClick={() => handleEditAssignment(assignment)}
                     >
                       <Edit className="w-5 h-5" />
                     </Button>
                     <Button 
                        variant="ghost" 
                        className="w-full h-10 bg-transparent hover:bg-red-500/20 text-white hover:text-red-100 transition-all duration-300"
                        title="Delete Assignment"
                        onClick={() => handleDeleteAssignment(assignment._id)}
                     >
                       <Trash2 className="w-5 h-5" />
                     </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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
    </FacultyLayout>
  );
};

export default FacultyAssignments;
