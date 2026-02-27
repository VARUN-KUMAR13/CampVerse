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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
    CheckCircle2,
    FileSpreadsheet,
    Loader2,
    Users,
    Calculator,
    Send,
    Eye,
    Edit,
} from "lucide-react";
import {
    getSubmittedGradeSheets,
    getGradeSheet,
    addExternalMarks,
    publishResults,
    GradeSheet,
    StudentGrade,
    calculateGrade,
    calculateInternalMarks,
} from "@/services/gradeService";

const AdminResults = () => {
    const { userData } = useAuth();
    const [gradeSheets, setGradeSheets] = useState<GradeSheet[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSheet, setSelectedSheet] = useState<GradeSheet | null>(null);
    const [editingGrades, setEditingGrades] = useState<StudentGrade[]>([]);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Filters
    const [filterDegree, setFilterDegree] = useState("Major");
    const [filterYear, setFilterYear] = useState("IV Year");
    const [filterBranch, setFilterBranch] = useState("CSE");
    const [filterSection, setFilterSection] = useState("B");
    const [filterSemester, setFilterSemester] = useState("Semester-I");

    // Fetch submitted grade sheets
    const fetchGradeSheets = async () => {
        try {
            setLoading(true);
            const data = await getSubmittedGradeSheets();
            setGradeSheets(data);
        } catch (error) {
            console.error("Error fetching grade sheets:", error);
            toast.error("Failed to load grade sheets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGradeSheets();
    }, []);

    // Load a grade sheet for editing
    const handleOpenSheet = async (sheet: GradeSheet) => {
        try {
            const fullSheet = await getGradeSheet(sheet._id);
            setSelectedSheet(fullSheet);
            setEditingGrades([...fullSheet.studentGrades]);
            setIsEditing(false);
        } catch (error) {
            console.error("Error loading grade sheet:", error);
            toast.error("Failed to load grade sheet");
        }
    };

    // Update external marks
    const handleExternalChange = (studentId: string, value: string) => {
        const numValue = value === "" ? null : parseFloat(value);
        setEditingGrades((prev) =>
            prev.map((g) =>
                g.studentId === studentId ? { ...g, external: numValue } : g
            )
        );
    };

    // Save external marks
    const handleSaveExternal = async () => {
        if (!selectedSheet) return;

        try {
            setSaving(true);
            const updates = editingGrades
                .filter((g) => g.external !== null)
                .map((g) => ({ studentId: g.studentId, external: g.external as number }));

            await addExternalMarks(selectedSheet._id, updates);
            toast.success("External marks saved!");

            // Refresh the sheet
            const updatedSheet = await getGradeSheet(selectedSheet._id);
            setSelectedSheet(updatedSheet);
            setEditingGrades([...updatedSheet.studentGrades]);
            setIsEditing(false);
            fetchGradeSheets();
        } catch (error) {
            console.error("Error saving external marks:", error);
            toast.error("Failed to save external marks");
        } finally {
            setSaving(false);
        }
    };

    // Publish results
    const handlePublish = async () => {
        if (!selectedSheet) return;

        // Check if all students have external marks
        const missingExternal = editingGrades.filter(
            (g) => g.external === null && g.internalMarks !== null
        );
        if (missingExternal.length > 0) {
            toast.error(`${missingExternal.length} students are missing external marks`);
            return;
        }

        try {
            setPublishing(true);
            await publishResults(selectedSheet._id, userData?.collegeId || "ADMIN");
            toast.success("Results published successfully!");
            setSelectedSheet(null);
            fetchGradeSheets();
        } catch (error) {
            console.error("Error publishing results:", error);
            toast.error("Failed to publish results");
        } finally {
            setPublishing(false);
        }
    };

    const handleBulkPublish = async () => {
        if (!userData?.collegeId) return;

        const pendingSheets = filteredGradeSheets.filter(
            (s) => s.status === "Submitted"
        );
        if (pendingSheets.length === 0) {
            toast.info("No pending results to publish for this section.");
            return;
        }

        if (!confirm(`Are you sure you want to logically publish all ${pendingSheets.length} pending subjects for this section? This locks them from further automated modification.`)) {
            return;
        }

        try {
            setPublishing(true);
            for (const sheet of pendingSheets) {
                await publishResults(sheet._id, userData.collegeId);
            }
            toast.success("All section results published successfully!");
            fetchGradeSheets();
        } catch (error) {
            console.error("Error bulk publishing:", error);
            toast.error("Failed to publish some results");
        } finally {
            setPublishing(false);
        }
    };

    // Calculate total and grade dynamically 
    const calculateTotal = (g: StudentGrade, external: number | null) => {
        const parsedInternal = calculateInternalMarks(g.mid1Total, g.mid2Total, g.project);
        if (parsedInternal === null || external === null) return null;
        return parsedInternal + external;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Published":
                return <Badge className="bg-green-500 text-white">Published</Badge>;
            case "Submitted":
                return <Badge className="bg-blue-500 text-white">Pending Review</Badge>;
            default:
                return <Badge className="bg-gray-500 text-white">Draft</Badge>;
        }
    };

    const filteredGradeSheets = gradeSheets.filter(
        (sheet) =>
            (sheet.degree === filterDegree || (!sheet.degree && filterDegree === "Major")) &&
            sheet.year === filterYear &&
            sheet.branch === filterBranch &&
            sheet.section === filterSection &&
            sheet.semester === filterSemester
    );

    const getGradeBadge = (grade: string | null) => {
        if (!grade) return null;
        const colors: Record<string, string> = {
            "O": "bg-green-600",
            "A+": "bg-green-500",
            "A": "bg-blue-500",
            "B+": "bg-blue-400",
            "B": "bg-yellow-500",
            "C": "bg-orange-500",
            "F": "bg-red-500",
        };
        return (
            <Badge className={`${colors[grade] || "bg-gray-500"} text-white`}>
                {grade}
            </Badge>
        );
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <img src="/results-icon.png" alt="Results" className="w-8 h-8 object-contain" />
                            Result Management
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Add external marks and publish final results
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : selectedSheet ? (
                    /* External Marks Entry View */
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FileSpreadsheet className="w-5 h-5" />
                                    {selectedSheet.subjectName} ({selectedSheet.subjectCode})
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Section {selectedSheet.section} | Semester {selectedSheet.semester} |
                                    Faculty: {selectedSheet.facultyName}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(!isEditing)}
                                    disabled={saving}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    {isEditing ? "Cancel Edit" : "Edit"}
                                </Button>
                                <Button variant="outline" onClick={() => {
                                    if (isEditing) {
                                        setIsEditing(false);
                                        setEditingGrades([...selectedSheet.studentGrades]);
                                    } else {
                                        setSelectedSheet(null);
                                    }
                                }}>
                                    Back
                                </Button>
                                {isEditing && (
                                    <Button onClick={handleSaveExternal} disabled={saving}>
                                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Save Changes
                                    </Button>
                                )}
                                {!isEditing && selectedSheet.status === "Submitted" && (
                                    <Button
                                        onClick={handlePublish}
                                        disabled={publishing}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {publishing ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                        )}
                                        Publish Results
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
                                            <TableHead className="text-center bg-blue-500/10">Mid-1 Total (35)</TableHead>
                                            <TableHead className="text-center bg-blue-500/10">Mid-2 Total (35)</TableHead>
                                            <TableHead className="text-center bg-purple-500/10">Project (5)</TableHead>
                                            <TableHead className="text-center bg-orange-500/10 font-bold">Internal (40)</TableHead>
                                            <TableHead className="text-center bg-red-500/10 font-bold">External (60)</TableHead>
                                            <TableHead className="text-center bg-cyan-500/10 font-bold">Total (100)</TableHead>
                                            <TableHead className="text-center">Grade</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {editingGrades.map((g, idx) => {
                                            const external = editingGrades.find(
                                                (e) => e.studentId === g.studentId
                                            )?.external ?? g.external;
                                            const total = calculateTotal(g, external);
                                            const gradeInfo = total ? calculateGrade(total) : null;

                                            return (
                                                <TableRow key={g.studentId}>
                                                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                                                    <TableCell className="font-mono text-sm">{g.studentId}</TableCell>
                                                    <TableCell className="text-center bg-blue-500/5">
                                                        {g.mid1Total?.toFixed(2) ?? "-"}
                                                    </TableCell>
                                                    <TableCell className="text-center bg-blue-500/5">
                                                        {g.mid2Total?.toFixed(2) ?? "-"}
                                                    </TableCell>
                                                    <TableCell className="text-center bg-purple-500/5">
                                                        {g.project ?? "-"}
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold bg-orange-500/10">
                                                        {calculateInternalMarks(g.mid1Total, g.mid2Total, g.project)?.toFixed(2) ?? "-"}
                                                    </TableCell>
                                                    <TableCell className="bg-red-500/5">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={60}
                                                            className="w-16 h-8 text-center"
                                                            value={external ?? ""}
                                                            onChange={(e) =>
                                                                handleExternalChange(g.studentId, e.target.value)
                                                            }
                                                            disabled={!isEditing}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-lg bg-cyan-500/10">
                                                        {total?.toFixed(2) ?? "-"}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {gradeInfo ? getGradeBadge(gradeInfo.grade) : "-"}
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
                    <div className="space-y-6">
                        {/* Filters */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div className="space-y-2">
                                        <Label>Degree</Label>
                                        <Select value={filterDegree} onValueChange={setFilterDegree}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Major">Major</SelectItem>
                                                <SelectItem value="Minor">Minor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Year</Label>
                                        <Select value={filterYear} onValueChange={setFilterYear}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="I Year">I Year</SelectItem>
                                                <SelectItem value="II Year">II Year</SelectItem>
                                                <SelectItem value="III Year">III Year</SelectItem>
                                                <SelectItem value="IV Year">IV Year</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Branch</Label>
                                        <Select value={filterBranch} onValueChange={setFilterBranch}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CSE">CSE</SelectItem>
                                                <SelectItem value="ECE">ECE</SelectItem>
                                                <SelectItem value="EEE">EEE</SelectItem>
                                                <SelectItem value="MECH">MECH</SelectItem>
                                                <SelectItem value="AI">AI</SelectItem>
                                                <SelectItem value="IT">IT</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Section</Label>
                                        <Select value={filterSection} onValueChange={setFilterSection}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {["A", "B", "C", "D", "E", "F", "G"].map((s) => (
                                                    <SelectItem key={s} value={s}>Section {s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Semester</Label>
                                        <Select value={filterSemester} onValueChange={setFilterSemester}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Semester-I">Semester-I</SelectItem>
                                                <SelectItem value="Semester-II">Semester-II</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end border-t pt-4">
                                    <Button
                                        onClick={handleBulkPublish}
                                        disabled={
                                            publishing ||
                                            filteredGradeSheets.length === 0 ||
                                            filteredGradeSheets.every(s => s.status === "Published")
                                        }
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {publishing ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                        )}
                                        Publish Section Results
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {filteredGradeSheets.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Submitted Grade Sheets</h3>
                                    <p className="text-muted-foreground">
                                        Grade sheets submitted by faculty will appear here
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredGradeSheets.map((sheet) => (
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
                                                    <span>
                                                        Section {sheet.section} | {sheet.studentCount} students
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calculator className="w-4 h-4" />
                                                    <span>
                                                        Sem {sheet.semester} | {sheet.academicYear}
                                                    </span>
                                                </div>
                                                <div className="text-xs">
                                                    Faculty: {sheet.facultyName}
                                                </div>
                                            </div>
                                            <Button
                                                className="w-full mt-4"
                                                variant={sheet.status === "Published" ? "outline" : "default"}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenSheet(sheet);
                                                }}
                                            >
                                                {sheet.status === "Published" ? (
                                                    <>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View Results
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-4 h-4 mr-2" />
                                                        Add External & Publish
                                                    </>
                                                )}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminResults;
