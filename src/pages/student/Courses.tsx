import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import StudentLayout from "@/components/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { User, FileText, BookOpen, Loader2, Download } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface CourseResource {
  _id?: string;
  name: string;
  type: string;
  fileData?: string;
  fileName?: string;
  fileSize?: number;
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
  department?: string;
  year?: string;
  semester?: string;
  classType?: string;
  sections?: string[];
  assignedStudents?: string[];
  createdAt: string;
}

const StudentCourses = () => {
  const { userData } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  // ── Compute student's current academic year from collegeId ──
  const getStudentCurrentYear = (): string => {
    const collegeId = userData?.collegeId || "";
    const yearCode = collegeId.substring(0, 2);
    if (!yearCode || !/^\d{2}$/.test(yearCode)) return "IV Year";
    const admissionYear = parseInt("20" + yearCode);
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const academicStartYear = curMonth >= 6 ? curYear : curYear - 1;
    const yearNum = academicStartYear - admissionYear + 1;
    const yearLabels = ["I Year", "II Year", "III Year", "IV Year"];
    return yearLabels[Math.min(Math.max(yearNum - 1, 0), 3)];
  };

  const [degree, setDegree] = useState("Major");
  const [selectedYear, setSelectedYear] = useState(() => getStudentCurrentYear());
  const [selectedSemester, setSelectedSemester] = useState(() => {
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
              setSelectedYear(mapping.year);
              setSelectedSemester(mapping.semLabel);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to initialize course mapping defaults:", err);
      }
    };
    fetchProfileSemester();
  }, [userData?.uid]);

  // Fetch courses relevant to this student
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const studentSection = userData?.section || "";
        const studentId = userData?.collegeId || "";

        const params = new URLSearchParams();
        if (studentSection) params.append("section", studentSection);
        if (studentId) params.append("studentId", studentId);

        const res = await fetch(`${API_BASE}/courses?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const activeCourses = data.filter((c: Course) => c.status === "Active").reverse();
          setCourses(activeCourses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [userData?.section, userData?.collegeId]);

  // Robust filtering to handle Faculty entering either relative ("Semester I") or absolute ("Semester VII") terms
  const filteredCourses = courses.filter((c) => {
    // Check Year
    const yearMatch = c.year === selectedYear || !c.year;
    
    // Check Semester
    let semesterMatch = false;
    const sem = c.semester || "";
    if (selectedSemester === "Semester-I") {
      semesterMatch = ["Semester-I", "Semester I", "Semester 1"].includes(sem);
      if (selectedYear === "I Year") semesterMatch = semesterMatch || sem === "Semester I";
      if (selectedYear === "II Year") semesterMatch = semesterMatch || sem === "Semester III";
      if (selectedYear === "III Year") semesterMatch = semesterMatch || sem === "Semester V";
      if (selectedYear === "IV Year") semesterMatch = semesterMatch || sem === "Semester VII";
    } else if (selectedSemester === "Semester-II") {
      semesterMatch = ["Semester-II", "Semester II", "Semester 2"].includes(sem);
      if (selectedYear === "I Year") semesterMatch = semesterMatch || sem === "Semester II";
      if (selectedYear === "II Year") semesterMatch = semesterMatch || sem === "Semester IV";
      if (selectedYear === "III Year") semesterMatch = semesterMatch || sem === "Semester VI";
      if (selectedYear === "IV Year") semesterMatch = semesterMatch || sem === "Semester VIII";
    }

    return yearMatch && semesterMatch;
  });

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
        console.error("Failed to download resource");
      }
    } catch (error) {
      console.error("Error downloading resource:", error);
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              My Courses
            </h1>
            <p className="text-muted-foreground mt-1">
              Explore and manage your enrolled academic courses and materials
            </p>
          </div>
        </div>

        {/* Top Filters — matching /student/assignments exactly */}
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

          <Select name="year" value={selectedYear} onValueChange={setSelectedYear}>
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

          <Select name="semester" value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semester-I">Semester-I</SelectItem>
              <SelectItem value="Semester-II">Semester-II</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              {courses.length > 0 ? "No courses available for this semester" : "No courses available yet"}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {courses.length > 0 ? "Select another semester to view your courses." : "Courses will appear here once your faculty adds them."}
            </p>
          </div>
        ) : (
          /* Courses Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div
                    className={`w-full h-20 ${course.color || "bg-blue-500"} rounded-lg flex items-center justify-center text-white font-bold text-lg mb-4`}
                  >
                    {course.courseCode}
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg leading-tight">{course.courseName}</CardTitle>
                    {course.classType && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 mt-0.5 ${
                          course.classType === "Theory"
                            ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                            : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        }`}
                      >
                        {course.classType}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1.5">
                    <User className="w-4 h-4" />
                    <span>{course.facultyName}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Course Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {course.credits}
                      </div>
                      <div className="text-xs text-muted-foreground">Credits</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {course.maxStudents}
                      </div>
                      <div className="text-xs text-muted-foreground">Students</div>
                    </div>
                  </div>

                  {/* Details Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setSelectedCourse(course)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {course.courseCode} - {course.courseName}
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* Course Description */}
                        {course.description && (
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">
                              Course Description
                            </h4>
                            <p className="text-muted-foreground">{course.description}</p>
                          </div>
                        )}

                        {/* Course Objectives */}
                        {course.objectives && course.objectives.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">
                              Course Objectives
                            </h4>
                            <ul className="space-y-1">
                              {course.objectives.map((objective, index) => (
                                <li
                                  key={index}
                                  className="text-muted-foreground flex items-start"
                                >
                                  <span className="mr-2">•</span>
                                  {objective}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Course Syllabus */}
                        {course.syllabus && course.syllabus.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">
                              Course Syllabus
                            </h4>
                            <div className="space-y-2">
                              {course.syllabus.map((item, index) => (
                                <div
                                  key={index}
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

                        {/* Course Resources */}
                        {course.resources && course.resources.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">
                              Course Resources
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              {course.resources.map((resource, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-2 p-3 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
                                  onClick={() => handleDownload(course._id, resource)}
                                >
                                  <FileText className="w-5 h-5 text-primary" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-primary text-sm truncate">
                                      {resource.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {resource.type}
                                    </div>
                                  </div>
                                  <Download className="w-4 h-4 text-primary/60" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentCourses;
