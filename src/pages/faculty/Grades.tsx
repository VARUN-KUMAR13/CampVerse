import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FacultyLayout from "@/components/FacultyLayout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Save,
  Send,
  Trash2,
  FileSpreadsheet,
  Loader2,
  Calculator,
  Users,
} from "lucide-react";
import {
  getFacultyGradeSheets,
  getGradeSheet,
  createGradeSheet,
  updateGrades,
  submitGradeSheet,
  deleteGradeSheet,
  generateStudentsForSection,
  GradeSheet,
  StudentGrade,
} from "@/services/gradeService";

const FacultyGrades = () => {
  const { userData } = useAuth();
  const [gradeSheets, setGradeSheets] = useState<GradeSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSheet, setSelectedSheet] = useState<GradeSheet | null>(null);
  const [editingGrades, setEditingGrades] = useState<StudentGrade[]>([]);
  const [saving, setSaving] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state for create
  const [formData, setFormData] = useState({
    subjectCode: "",
    subjectName: "",
    credits: 3,
    year: "2022",
    branch: "CSE",
    section: "B",
    semester: "7",
    academicYear: "2025-26",
  });

  // Fetch grade sheets
  const fetchGradeSheets = async () => {
    try {
      setLoading(true);
      const facultyId = userData?.collegeId || "";
      if (!facultyId) return;
      const data = await getFacultyGradeSheets(facultyId);
      setGradeSheets(data);
    } catch (error) {
      console.error("Error fetching grade sheets:", error);
      toast.error("Failed to load grade sheets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.collegeId) {
      fetchGradeSheets();
    }
  }, [userData?.collegeId]);

  // Create new grade sheet
  const handleCreateSheet = async () => {
    if (!formData.subjectCode || !formData.subjectName) {
      toast.error("Please fill in subject code and name");
      return;
    }

    try {
      setCreating(true);
      const students = generateStudentsForSection(formData.section, 64);

      await createGradeSheet({
        ...formData,
        facultyId: userData?.collegeId || "",
        facultyName: userData?.name || "Faculty",
        students,
      });

      toast.success("Grade sheet created!");
      setIsCreateDialogOpen(false);
      setFormData({
        subjectCode: "",
        subjectName: "",
        credits: 3,
        year: "2022",
        branch: "CSE",
        section: "B",
        semester: "7",
        academicYear: "2025-26",
      });
      fetchGradeSheets();
    } catch (error) {
      console.error("Error creating grade sheet:", error);
      toast.error("Failed to create grade sheet");
    } finally {
      setCreating(false);
    }
  };

  // Load a grade sheet for editing
  const handleOpenSheet = async (sheet: GradeSheet) => {
    try {
      const fullSheet = await getGradeSheet(sheet._id);
      setSelectedSheet(fullSheet);
      setEditingGrades([...fullSheet.studentGrades]);
    } catch (error) {
      console.error("Error loading grade sheet:", error);
      toast.error("Failed to load grade sheet");
    }
  };

  // Update a grade value
  const handleGradeChange = (
    studentId: string,
    field: keyof StudentGrade,
    value: string
  ) => {
    const numValue = value === "" ? null : parseFloat(value);
    setEditingGrades((prev) =>
      prev.map((g) =>
        g.studentId === studentId ? { ...g, [field]: numValue } : g
      )
    );
  };

  // Save grades
  const handleSaveGrades = async () => {
    if (!selectedSheet) return;

    try {
      setSaving(true);
      await updateGrades(selectedSheet._id, editingGrades);
      toast.success("Grades saved successfully!");
      fetchGradeSheets();
    } catch (error) {
      console.error("Error saving grades:", error);
      toast.error("Failed to save grades");
    } finally {
      setSaving(false);
    }
  };

  // Submit to admin
  const handleSubmitToAdmin = async () => {
    if (!selectedSheet) return;

    try {
      await submitGradeSheet(selectedSheet._id);
      toast.success("Grade sheet submitted to admin!");
      setSelectedSheet(null);
      fetchGradeSheets();
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("Failed to submit");
    }
  };

  // Delete grade sheet
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this grade sheet?")) return;

    try {
      await deleteGradeSheet(id);
      toast.success("Grade sheet deleted");
      fetchGradeSheets();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete");
    }
  };

  // Calculate derived values for display
  const calculateDerived = (g: StudentGrade) => {
    const mid1Conv = g.mid1 !== null ? Math.round(g.mid1 * 0.75 * 100) / 100 : null;
    const mid2Conv = g.mid2 !== null ? Math.round(g.mid2 * 0.75 * 100) / 100 : null;
    const mid1Total = mid1Conv !== null && g.assignment1 !== null ? mid1Conv + g.assignment1 : null;
    const mid2Total = mid2Conv !== null && g.assignment2 !== null ? mid2Conv + g.assignment2 : null;
    const avg = mid1Total !== null && mid2Total !== null ? (mid1Total + mid2Total) / 2 : null;
    const internal = avg !== null && g.project !== null ? Math.round((avg + g.project) * 100) / 100 : null;
    return { mid1Conv, mid2Conv, mid1Total, mid2Total, internal };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
        return <Badge className="bg-green-500 text-white">Published</Badge>;
      case "Submitted":
        return <Badge className="bg-blue-500 text-white">Submitted</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Draft</Badge>;
    }
  };

  return (
    <FacultyLayout>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Grade Management</h1>
          <p className="text-muted-foreground">Enter and manage student grades</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Grade Sheet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Grade Sheet</DialogTitle>
              <DialogDescription>
                Create a new grade sheet for a subject
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Subject Code *</Label>
                  <Input
                    placeholder="e.g., 22CS701"
                    value={formData.subjectCode}
                    onChange={(e) =>
                      setFormData({ ...formData, subjectCode: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Credits</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.credits}
                    onChange={(e) =>
                      setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Subject Name *</Label>
                <Input
                  placeholder="e.g., Machine Learning"
                  value={formData.subjectName}
                  onChange={(e) =>
                    setFormData({ ...formData, subjectName: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Year</Label>
                  <Select
                    value={formData.year}
                    onValueChange={(v) => setFormData({ ...formData, year: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2022">2022 (4th)</SelectItem>
                      <SelectItem value="2023">2023 (3rd)</SelectItem>
                      <SelectItem value="2024">2024 (2nd)</SelectItem>
                      <SelectItem value="2025">2025 (1st)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Branch</Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(v) => setFormData({ ...formData, branch: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSE">CSE</SelectItem>
                      <SelectItem value="ECE">ECE</SelectItem>
                      <SelectItem value="EEE">EEE</SelectItem>
                      <SelectItem value="MECH">MECH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Section</Label>
                  <Select
                    value={formData.section}
                    onValueChange={(v) => setFormData({ ...formData, section: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["A", "B", "C", "D", "E", "F", "G"].map((s) => (
                        <SelectItem key={s} value={s}>Section {s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Semester</Label>
                  <Select
                    value={formData.semester}
                    onValueChange={(v) => setFormData({ ...formData, semester: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Academic Year</Label>
                  <Input
                    placeholder="2025-26"
                    value={formData.academicYear}
                    onChange={(e) =>
                      setFormData({ ...formData, academicYear: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSheet} disabled={creating}>
                {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Sheet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : selectedSheet ? (
        /* Grade Entry View */
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                {selectedSheet.subjectName} ({selectedSheet.subjectCode})
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Section {selectedSheet.section} | Semester {selectedSheet.semester} | {selectedSheet.academicYear}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedSheet(null)}>
                Back
              </Button>
              <Button onClick={handleSaveGrades} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save
              </Button>
              {selectedSheet.status === "Draft" && (
                <Button onClick={handleSubmitToAdmin} className="bg-green-600 hover:bg-green-700">
                  <Send className="w-4 h-4 mr-2" />
                  Submit to Admin
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead className="w-[120px]">Roll No</TableHead>
                    <TableHead className="w-[80px] text-center bg-blue-500/10">Mid-1 (40)</TableHead>
                    <TableHead className="w-[60px] text-center bg-blue-500/10">×0.75</TableHead>
                    <TableHead className="w-[80px] text-center bg-green-500/10">Assign-1 (5)</TableHead>
                    <TableHead className="w-[60px] text-center bg-yellow-500/10">Mid-1 Total</TableHead>
                    <TableHead className="w-[80px] text-center bg-blue-500/10">Mid-2 (40)</TableHead>
                    <TableHead className="w-[60px] text-center bg-blue-500/10">×0.75</TableHead>
                    <TableHead className="w-[80px] text-center bg-green-500/10">Assign-2 (5)</TableHead>
                    <TableHead className="w-[60px] text-center bg-yellow-500/10">Mid-2 Total</TableHead>
                    <TableHead className="w-[80px] text-center bg-purple-500/10">Project (5)</TableHead>
                    <TableHead className="w-[80px] text-center bg-orange-500/10 font-bold">Internal (40)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editingGrades.map((g, idx) => {
                    const calc = calculateDerived(g);
                    return (
                      <TableRow key={g.studentId}>
                        <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="font-mono text-sm">{g.studentId}</TableCell>
                        <TableCell className="bg-blue-500/5">
                          <Input
                            type="number"
                            min={0}
                            max={40}
                            className="w-16 h-8 text-center"
                            value={g.mid1 ?? ""}
                            onChange={(e) => handleGradeChange(g.studentId, "mid1", e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="text-center text-sm bg-blue-500/5">
                          {calc.mid1Conv?.toFixed(2) ?? "-"}
                        </TableCell>
                        <TableCell className="bg-green-500/5">
                          <Input
                            type="number"
                            min={0}
                            max={5}
                            className="w-14 h-8 text-center"
                            value={g.assignment1 ?? ""}
                            onChange={(e) => handleGradeChange(g.studentId, "assignment1", e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="text-center font-medium bg-yellow-500/5">
                          {calc.mid1Total?.toFixed(2) ?? "-"}
                        </TableCell>
                        <TableCell className="bg-blue-500/5">
                          <Input
                            type="number"
                            min={0}
                            max={40}
                            className="w-16 h-8 text-center"
                            value={g.mid2 ?? ""}
                            onChange={(e) => handleGradeChange(g.studentId, "mid2", e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="text-center text-sm bg-blue-500/5">
                          {calc.mid2Conv?.toFixed(2) ?? "-"}
                        </TableCell>
                        <TableCell className="bg-green-500/5">
                          <Input
                            type="number"
                            min={0}
                            max={5}
                            className="w-14 h-8 text-center"
                            value={g.assignment2 ?? ""}
                            onChange={(e) => handleGradeChange(g.studentId, "assignment2", e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="text-center font-medium bg-yellow-500/5">
                          {calc.mid2Total?.toFixed(2) ?? "-"}
                        </TableCell>
                        <TableCell className="bg-purple-500/5">
                          <Input
                            type="number"
                            min={0}
                            max={5}
                            className="w-14 h-8 text-center"
                            value={g.project ?? ""}
                            onChange={(e) => handleGradeChange(g.studentId, "project", e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="text-center font-bold text-lg bg-orange-500/10">
                          {calc.internal?.toFixed(2) ?? "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Grade Sheets List */
        <div className="space-y-4">
          {gradeSheets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Grade Sheets</h3>
                <p className="text-muted-foreground">
                  Click "Create Grade Sheet" to start entering grades
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gradeSheets.map((sheet) => (
                <Card
                  key={sheet._id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleOpenSheet(sheet)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{sheet.subjectName}</h3>
                        <p className="text-sm text-muted-foreground">{sheet.subjectCode}</p>
                      </div>
                      {getStatusBadge(sheet.status)}
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Section {sheet.section} | {sheet.studentCount} students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        <span>Sem {sheet.semester} | {sheet.academicYear}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenSheet(sheet);
                        }}
                      >
                        Edit Grades
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(sheet._id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </FacultyLayout>
  );
};

export default FacultyGrades;
