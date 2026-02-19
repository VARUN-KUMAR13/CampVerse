import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  createdAt: string;
}

const StudentCourses = () => {
  const { userData } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Fetch all active courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/courses`);
        if (res.ok) {
          const data = await res.json();
          setCourses(data.filter((c: Course) => c.status === "Active"));
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Download a resource
  const handleDownload = (resource: CourseResource) => {
    if (resource.fileData) {
      const link = document.createElement("a");
      link.href = resource.fileData;
      link.download = resource.fileName || resource.name;
      link.click();
    }
  };

  return (
    <StudentLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-24">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            No courses available yet
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Courses will appear here once your faculty adds them.
          </p>
        </div>
      ) : (
        /* Courses Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div
                  className={`w-full h-20 ${course.color || "bg-blue-500"} rounded-lg flex items-center justify-center text-white font-bold text-lg mb-4`}
                >
                  {course.courseCode}
                </div>
                <CardTitle className="text-lg">{course.courseName}</CardTitle>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
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
                                onClick={() => handleDownload(resource)}
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
    </StudentLayout>
  );
};

export default StudentCourses;
