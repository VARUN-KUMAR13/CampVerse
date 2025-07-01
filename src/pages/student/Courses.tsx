import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import { useAuth } from "@/contexts/AuthContext";
import { User, Clock, FileText } from "lucide-react";

const StudentCourses = () => {
  const { userData } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const courses = [
    {
      id: "CS001",
      name: "Python for EDA",
      instructor: "Dr. D. Sujan Kumar",
      credits: 4,
      hours: 60,
      progress: 75,
      color: "bg-blue-500",
    },
    {
      id: "CS002",
      name: "Operating Systems",
      instructor: "G.Deepika",
      credits: 4,
      hours: 60,
      progress: 65,
      color: "bg-green-500",
    },
    {
      id: "CS003",
      name: "Design & Analysis of Algorithms",
      instructor: "Dr. M. Raghava",
      credits: 4,
      hours: 60,
      progress: 80,
      color: "bg-orange-500",
    },
    {
      id: "CS004",
      name: "Software Engineering",
      instructor: "Dr. P. Madhavi",
      credits: 4,
      hours: 60,
      progress: 70,
      color: "bg-purple-500",
    },
    {
      id: "CS005",
      name: "Computational Statistics",
      instructor: "I.B.N.Hima Bindu",
      credits: 4,
      hours: 60,
      progress: 60,
      color: "bg-purple-600",
    },
  ];

  const courseDetails = {
    CS002: {
      title: "CS2002 - Operating Systems",
      description:
        "This course covers fundamental concepts of operating systems including process management, memory management, file systems, and concurrency. Students will gain hands-on experience with system programming and OS internals.",
      objectives: [
        "Understand OS architecture",
        "Learn process scheduling",
        "Master memory management",
        "Study file systems",
        "Implement system calls",
      ],
      syllabus: [
        { topic: "OS Overview", duration: "2 weeks" },
        { topic: "Process Management", duration: "3 weeks" },
        { topic: "Memory Management", duration: "3 weeks" },
        { topic: "File Systems", duration: "2 weeks" },
        { topic: "Concurrency", duration: "2 weeks" },
        { topic: "System Programming", duration: "2 weeks" },
      ],
      resources: [
        { name: "OS Textbook", type: "PDF", icon: "📄" },
        { name: "Lab Manual", type: "PDF", icon: "📄" },
        { name: "System Calls Guide", type: "PDF", icon: "📄" },
        { name: "Practice Problems", type: "DOC", icon: "📄" },
      ],
    },
  };

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />

      <div className="flex-1 flex flex-col">
        <StudentTopbar studentId="23BB1A3235" />

        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          </div>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div
                    className={`w-full h-20 ${course.color} rounded-lg flex items-center justify-center text-white font-bold text-lg mb-4`}
                  >
                    {course.id}
                  </div>
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{course.instructor}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Course Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {course.credits}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Credits
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {course.hours}
                      </div>
                      <div className="text-xs text-muted-foreground">Hours</div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Course Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
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
                          {courseDetails["CS002"]?.title}
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* Course Description */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">
                            Course Description
                          </h4>
                          <p className="text-muted-foreground">
                            {courseDetails["CS002"]?.description}
                          </p>
                        </div>

                        {/* Course Objectives */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">
                            Course Objectives
                          </h4>
                          <ul className="space-y-1">
                            {courseDetails["CS002"]?.objectives.map(
                              (objective, index) => (
                                <li
                                  key={index}
                                  className="text-muted-foreground flex items-start"
                                >
                                  <span className="mr-2">•</span>
                                  {objective}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>

                        {/* Course Syllabus */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">
                            Course Syllabus
                          </h4>
                          <div className="space-y-2">
                            {courseDetails["CS002"]?.syllabus.map(
                              (item, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center p-2 bg-muted/30 rounded"
                                >
                                  <span className="text-foreground">
                                    {item.topic}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {item.duration}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        {/* Course Resources */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">
                            Course Resources
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {courseDetails["CS002"]?.resources.map(
                              (resource, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-2 p-3 bg-primary/10 rounded-lg"
                                >
                                  <span className="text-2xl">
                                    {resource.icon}
                                  </span>
                                  <div>
                                    <div className="font-medium text-primary">
                                      {resource.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {resource.type}
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentCourses;
