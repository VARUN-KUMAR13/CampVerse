import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FacultySidebar from "@/components/FacultySidebar";
import { Search, Eye, TrendingUp, Users, BookOpen, Star } from "lucide-react";

const FacultyGrades = () => {
  const students = [
    {
      id: "23BB1A3201",
      name: "INAPANURI ABHIJITH",
      course: "CS101",
      courseName: "Introduction to Computer Science",
      midterm: 85,
      final: 92,
      assignments: 88,
      overall: "A",
      gpa: 3.8,
    },
    {
      id: "23BB1A3202",
      name: "SANDRI AKSHAINI",
      course: "CS101",
      courseName: "Introduction to Computer Science",
      midterm: 78,
      final: 84,
      assignments: 90,
      overall: "B+",
      gpa: 3.5,
    },
    {
      id: "23BB1A3203",
      name: "MUSKU AKSHAY",
      course: "CS101",
      courseName: "Introduction to Computer Science",
      midterm: 92,
      final: 95,
      assignments: 94,
      overall: "A+",
      gpa: 4.0,
    },
    {
      id: "23BB1A3204",
      name: "REVARTHI ANAND",
      course: "CS101",
      courseName: "Introduction to Computer Science",
      midterm: 76,
      final: 80,
      assignments: 82,
      overall: "B",
      gpa: 3.2,
    },
    {
      id: "23BB1A3205",
      name: "ARJUN",
      course: "CS101",
      courseName: "Introduction to Computer Science",
      midterm: 88,
      final: 90,
      assignments: 86,
      overall: "A-",
      gpa: 3.7,
    },
  ];

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
        return "bg-green-100 text-green-800";
      case "A":
        return "bg-green-100 text-green-700";
      case "A-":
        return "bg-blue-100 text-blue-700";
      case "B+":
        return "bg-yellow-100 text-yellow-700";
      case "B":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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
                <Input
                  placeholder="Search students..."
                  className="pl-10 w-64"
                />
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs101">CS101 - Intro to CS</SelectItem>
                  <SelectItem value="cs201">CS201 - Data Structures</SelectItem>
                  <SelectItem value="cs301">
                    CS301 - Database Systems
                  </SelectItem>
                </SelectContent>
              </Select>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Star className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">3.64</p>
                      <p className="text-sm text-muted-foreground">
                        Average GPA
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">87%</p>
                      <p className="text-sm text-muted-foreground">Pass Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">45</p>
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
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <BookOpen className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">12</p>
                      <p className="text-sm text-muted-foreground">
                        Assignments Graded
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Grades Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Student Grades - CS101: Introduction to Computer Science
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-4 py-2 border-b text-sm font-medium text-muted-foreground">
                    <div>Student</div>
                    <div>ID</div>
                    <div>Midterm</div>
                    <div>Final</div>
                    <div>Assignments</div>
                    <div>Overall Grade</div>
                    <div>Actions</div>
                  </div>

                  {students.map((student, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-7 gap-4 py-3 items-center hover:bg-muted/30 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-foreground">
                        {student.name}
                      </div>
                      <div className="text-muted-foreground">{student.id}</div>
                      <div className="text-foreground">{student.midterm}%</div>
                      <div className="text-foreground">{student.final}%</div>
                      <div className="text-foreground">
                        {student.assignments}%
                      </div>
                      <div>
                        <Badge className={getGradeColor(student.overall)}>
                          {student.overall} ({student.gpa})
                        </Badge>
                      </div>
                      <div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Edit Grades
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

export default FacultyGrades;
