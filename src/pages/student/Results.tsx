import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Loader2, FileText } from "lucide-react";
import { getStudentResults, StudentResult } from "@/services/gradeService";

const StudentResults = () => {
  const { userData } = useAuth();
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [degree, setDegree] = useState("Major");
  const [year, setYear] = useState("IV Year");
  const [semester, setSemester] = useState("Semester-I");

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

  // Filter results based on the dropdown selections natively
  const filteredResults = useMemo(() => {
    return results.filter(
      (r) =>
        (r.degree === degree || (!r.degree && degree === "Major")) &&
        r.year === year &&
        r.semester === semester
    );
  }, [results, degree, year, semester]);

  const getStatus = (grade: string | null) => {
    if (!grade) return "-";
    return grade === "F" ? "FAIL" : "PASS";
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-8 h-8 text-primary" />
              Results
            </h1>
            <p className="text-muted-foreground mt-1">
              View your academic performance, subject grades, and cumulative scores
            </p>
          </div>
        </div>

        {/* Top Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={degree} onValueChange={setDegree}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Degree" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Major">Major</SelectItem>
              <SelectItem value="Minor">Minor</SelectItem>
            </SelectContent>
          </Select>

          <Select value={year} onValueChange={setYear}>
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

          <Select value={semester} onValueChange={setSemester}>
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
        ) : filteredResults.length === 0 ? (
          <Card className="border shadow-none bg-card/50">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Results Found</h3>
              <p className="text-muted-foreground text-sm">
                No results match your selected Degree, Year, and Semester combination, or they haven't been published yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Main Results Table */}
            <div className="border rounded-md bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableHead className="font-semibold text-primary py-4 w-[60%] text-sm">
                      Subject
                    </TableHead>
                    <TableHead className="font-semibold text-primary py-4 text-sm">
                      Grade
                    </TableHead>
                    <TableHead className="font-semibold text-primary py-4 text-sm">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-primary py-4 text-sm">
                      Credits
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result, idx) => (
                    <TableRow
                      key={idx}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium py-4 text-foreground text-sm">
                        {result.subjectName}
                      </TableCell>
                      <TableCell className="py-4 text-sm font-medium">
                        {result.grades?.grade ?? "-"}
                      </TableCell>
                      <TableCell className="py-4 text-sm font-medium text-muted-foreground">
                        {getStatus(result.grades?.grade ?? null)}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground">
                        {result.credits}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* SGPA & CGPA Summary */}
            <div className="border rounded-md bg-card overflow-hidden mt-6">
              <Table>
                <TableBody>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableCell className="font-medium text-foreground py-4 w-[60%]">
                      SGPA
                    </TableCell>
                    <TableCell className="py-4 font-medium text-foreground">
                      8.4 {/* Placeholder */}
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="font-medium text-foreground py-4 w-[60%]">
                      CGPA
                    </TableCell>
                    <TableCell className="py-4 font-medium text-foreground">
                      7.79 {/* Placeholder */}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentResults;
