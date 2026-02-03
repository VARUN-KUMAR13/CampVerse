import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Trophy,
  TrendingUp,
  Loader2,
  FileText,
} from "lucide-react";
import { getStudentResults, StudentResult } from "@/services/gradeService";

const StudentResults = () => {
  const { userData } = useAuth();
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  // Fetch student results
  const fetchResults = async () => {
    try {
      setLoading(true);
      const studentId = userData?.collegeId || "";
      if (!studentId) return;
      const data = await getStudentResults(studentId);
      setResults(data);
    } catch (error) {
      console.error("Error fetching results:", error);
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.collegeId) {
      fetchResults();
    }
  }, [userData?.collegeId]);

  // Toggle expanded state
  const toggleExpanded = (subjectCode: string) => {
    setExpandedSubjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subjectCode)) {
        newSet.delete(subjectCode);
      } else {
        newSet.add(subjectCode);
      }
      return newSet;
    });
  };

  // Get grade badge color
  const getGradeBadge = (grade: string | null) => {
    if (!grade) return null;
    const colors: Record<string, string> = {
      O: "bg-gradient-to-r from-green-500 to-emerald-600",
      "A+": "bg-gradient-to-r from-green-400 to-green-500",
      A: "bg-gradient-to-r from-blue-500 to-blue-600",
      "B+": "bg-gradient-to-r from-blue-400 to-blue-500",
      B: "bg-gradient-to-r from-yellow-500 to-yellow-600",
      C: "bg-gradient-to-r from-orange-500 to-orange-600",
      F: "bg-gradient-to-r from-red-500 to-red-600",
    };
    return (
      <Badge className={`${colors[grade] || "bg-gray-500"} text-white text-lg px-3 py-1`}>
        {grade}
      </Badge>
    );
  };

  // Calculate SGPA
  const calculateSGPA = () => {
    if (results.length === 0) return 0;
    let totalCredits = 0;
    let totalGradePoints = 0;

    results.forEach((r) => {
      if (r.grades?.gradePoints !== null && r.grades?.gradePoints !== undefined) {
        totalCredits += r.credits;
        totalGradePoints += r.credits * r.grades.gradePoints;
      }
    });

    return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
  };

  // Calculate total marks
  const calculateTotalMarks = () => {
    if (results.length === 0) return { obtained: 0, total: 0 };
    let obtained = 0;
    let total = 0;

    results.forEach((r) => {
      if (r.grades?.totalMarks !== null && r.grades?.totalMarks !== undefined) {
        obtained += r.grades.totalMarks;
        total += 100;
      }
    });

    return { obtained: obtained.toFixed(2), total };
  };

  const sgpa = calculateSGPA();
  const marks = calculateTotalMarks();

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentTopbar studentId={userData?.collegeId || ""} />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Results & Grades</h1>
            <p className="text-muted-foreground">
              View your academic performance with complete transparency
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : results.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Results Available</h3>
                <p className="text-muted-foreground">
                  Your results will appear here once they are published
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">SGPA</p>
                        <p className="text-3xl font-bold text-foreground">{sgpa}</p>
                      </div>
                      <div className="p-3 bg-blue-500/20 rounded-full">
                        <Trophy className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Marks</p>
                        <p className="text-3xl font-bold text-foreground">
                          {marks.obtained} / {marks.total}
                        </p>
                      </div>
                      <div className="p-3 bg-green-500/20 rounded-full">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Subjects</p>
                        <p className="text-3xl font-bold text-foreground">{results.length}</p>
                      </div>
                      <div className="p-3 bg-purple-500/20 rounded-full">
                        <BookOpen className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results List */}
              <div className="space-y-4">
                {results.map((result) => (
                  <Collapsible
                    key={result.subjectCode}
                    open={expandedSubjects.has(result.subjectCode)}
                    onOpenChange={() => toggleExpanded(result.subjectCode)}
                  >
                    <Card className="overflow-hidden">
                      <CollapsibleTrigger className="w-full">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-left">
                                <h3 className="font-semibold text-lg">{result.subjectName}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {result.subjectCode} | {result.credits} Credits |
                                  Sem {result.semester}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-2xl font-bold">
                                  {result.grades?.totalMarks?.toFixed(2) ?? "-"}
                                </div>
                                <div className="text-sm text-muted-foreground">/ 100</div>
                              </div>
                              {getGradeBadge(result.grades?.grade ?? null)}
                              {expandedSubjects.has(result.subjectCode) ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-6 px-6">
                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-4 text-foreground">
                              Marks Breakdown (Transparency View)
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Internal Marks Section */}
                              <Card className="bg-muted/30">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium">
                                    Internal Marks (40)
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <Table>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell className="font-medium">Mid-1 (40)</TableCell>
                                        <TableCell className="text-right">
                                          {result.grades?.mid1 ?? "-"}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-medium text-muted-foreground">
                                          → Converted (×0.75)
                                        </TableCell>
                                        <TableCell className="text-right text-blue-600">
                                          {result.grades?.mid1Converted?.toFixed(2) ?? "-"}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-medium">Assignment-1 (5)</TableCell>
                                        <TableCell className="text-right">
                                          {result.grades?.assignment1 ?? "-"}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow className="bg-blue-500/10">
                                        <TableCell className="font-medium">Mid-1 Total</TableCell>
                                        <TableCell className="text-right font-bold">
                                          {result.grades?.mid1Total?.toFixed(2) ?? "-"}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-medium">Mid-2 (40)</TableCell>
                                        <TableCell className="text-right">
                                          {result.grades?.mid2 ?? "-"}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-medium text-muted-foreground">
                                          → Converted (×0.75)
                                        </TableCell>
                                        <TableCell className="text-right text-blue-600">
                                          {result.grades?.mid2Converted?.toFixed(2) ?? "-"}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-medium">Assignment-2 (5)</TableCell>
                                        <TableCell className="text-right">
                                          {result.grades?.assignment2 ?? "-"}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow className="bg-blue-500/10">
                                        <TableCell className="font-medium">Mid-2 Total</TableCell>
                                        <TableCell className="text-right font-bold">
                                          {result.grades?.mid2Total?.toFixed(2) ?? "-"}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-medium">Project (5)</TableCell>
                                        <TableCell className="text-right">
                                          {result.grades?.project ?? "-"}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow className="bg-orange-500/10">
                                        <TableCell className="font-bold">Internal Total</TableCell>
                                        <TableCell className="text-right font-bold text-lg text-orange-600">
                                          {result.grades?.internalMarks?.toFixed(2) ?? "-"} / 40
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </CardContent>
                              </Card>

                              {/* Final Result Section */}
                              <Card className="bg-muted/30">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium">
                                    Final Result
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <Table>
                                    <TableBody>
                                      <TableRow className="bg-orange-500/10">
                                        <TableCell className="font-bold">Internal Marks</TableCell>
                                        <TableCell className="text-right font-bold">
                                          {result.grades?.internalMarks?.toFixed(2) ?? "-"} / 40
                                        </TableCell>
                                      </TableRow>
                                      <TableRow className="bg-red-500/10">
                                        <TableCell className="font-bold">External Marks</TableCell>
                                        <TableCell className="text-right font-bold">
                                          {result.grades?.external ?? "-"} / 60
                                        </TableCell>
                                      </TableRow>
                                      <TableRow className="bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                                        <TableCell className="font-bold text-lg">Total Marks</TableCell>
                                        <TableCell className="text-right font-bold text-2xl text-green-600">
                                          {result.grades?.totalMarks?.toFixed(2) ?? "-"} / 100
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-bold">Grade</TableCell>
                                        <TableCell className="text-right">
                                          {getGradeBadge(result.grades?.grade ?? null)}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-bold">Grade Points</TableCell>
                                        <TableCell className="text-right font-bold text-lg">
                                          {result.grades?.gradePoints ?? "-"}
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>

                                  <div className="mt-4 p-4 bg-blue-500/10 rounded-lg text-sm">
                                    <p className="font-medium text-foreground mb-2">
                                      Calculation Formula:
                                    </p>
                                    <ul className="space-y-1 text-muted-foreground">
                                      <li>• Mid Converted = Mid (40) × 0.75 = 30 max</li>
                                      <li>• Mid Total = Mid Converted + Assignment = 35 max</li>
                                      <li>• Internal = (Mid-1 Total + Mid-2 Total) / 2 + Project</li>
                                      <li>• Total = Internal (40) + External (60) = 100</li>
                                    </ul>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                            <div className="mt-4 text-xs text-muted-foreground">
                              Faculty: {result.facultyName} | Published: {new Date(result.publishedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentResults;
