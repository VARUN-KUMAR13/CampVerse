import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FacultySidebar from "@/components/FacultySidebar";
import FacultyTopbar from "@/components/FacultyTopbar";
import { Search, Eye, Users, BookOpen, Plus } from "lucide-react";

const FacultyCourses = () => {
  const courses = [
    {
      id: "CS101",
      name: "Introduction to Computer Science",
      code: "CS101",
      credits: 3,
      students: 45,
      section: "A",
      semester: "VI",
      status: "Active",
    },
    {
      id: "CS201",
      name: "Data Structures and Algorithms",
      code: "CS201",
      credits: 4,
      students: 42,
      section: "A",
      semester: "VI",
      status: "Active",
    },
    {
      id: "CS301",
      name: "Database Management Systems",
      code: "CS301",
      credits: 3,
      students: 38,
      section: "A",
      semester: "VI",
      status: "Active",
    },
    {
      id: "CS401",
      name: "Software Engineering",
      code: "CS401",
      credits: 3,
      students: 40,
      section: "A",
      semester: "VI",
      status: "Active",
    },
    {
      id: "CS501",
      name: "Web Development",
      code: "CS501",
      credits: 4,
      students: 35,
      section: "A",
      semester: "VI",
      status: "Active",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <FacultySidebar />

      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search courses..." className="pl-10 w-64" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-medium text-foreground">DSK001</div>
                <div className="text-sm text-muted-foreground">
                  Faculty ID: DSK001
                </div>
              </div>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                DS
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">5</p>
                      <p className="text-sm text-muted-foreground">
                        Total Courses
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">200</p>
                      <p className="text-sm text-muted-foreground">
                        Total Students
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">17</p>
                      <p className="text-sm text-muted-foreground">
                        Total Credits
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Courses Table */}
            <Card>
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-6 gap-4 py-2 border-b text-sm font-medium text-muted-foreground">
                    <div>Course Code</div>
                    <div>Course Name</div>
                    <div>Credits</div>
                    <div>Students</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </div>

                  {courses.map((course, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-6 gap-4 py-3 items-center hover:bg-muted/30 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-foreground">
                        {course.code}
                      </div>
                      <div className="text-foreground">{course.name}</div>
                      <div className="text-muted-foreground">
                        {course.credits}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {course.students}
                        </span>
                      </div>
                      <div>
                        <Badge
                          variant={
                            course.status === "Active" ? "default" : "secondary"
                          }
                        >
                          {course.status}
                        </Badge>
                      </div>
                      <div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacultyCourses;
