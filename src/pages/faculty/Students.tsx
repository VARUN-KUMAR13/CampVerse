import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FacultySidebar from "@/components/FacultySidebar";
import FacultyTopbar from "@/components/FacultyTopbar";
import { Search, Eye, Download } from "lucide-react";

const FacultyStudents = () => {
  const students = [
    {
      id: "23BB1A3201",
      name: "INAPANURI ABHIJITH",
      course: "CSBS",
      section: "A",
      avatar: "IA",
    },
    {
      id: "23BB1A3202",
      name: "SANDRI AKSHAINI",
      course: "CSBS",
      section: "A",
      avatar: "SA",
    },
    {
      id: "23BB1A3203",
      name: "MUSKU AKSHAY",
      course: "CSBS",
      section: "A",
      avatar: "MA",
    },
    {
      id: "23BB1A3204",
      name: "REVARTHI ANAND",
      course: "CSBS",
      section: "A",
      avatar: "RA",
    },
    {
      id: "23BB1A3205",
      name: "ARJUN",
      course: "CSBS",
      section: "A",
      avatar: "AR",
    },
    {
      id: "23BB1A3206",
      name: "KOMMU ASHWINI",
      course: "CSBS",
      section: "A",
      avatar: "KA",
    },
    {
      id: "23BB1A3207",
      name: "MALE BALA KRISHNA REDDY",
      course: "CSBS",
      section: "A",
      avatar: "MR",
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
                <Input
                  placeholder="Search students..."
                  className="pl-10 w-64"
                />
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
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Students Table */}
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 py-2 border-b text-sm font-medium text-muted-foreground">
                  <div>Student</div>
                  <div>ID</div>
                  <div>Course</div>
                  <div>Section</div>
                </div>

                {students.map((student, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 gap-4 py-3 items-center hover:bg-muted/30 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {student.avatar}
                      </div>
                      <span className="font-medium text-foreground">
                        {student.name}
                      </span>
                    </div>
                    <div className="text-muted-foreground">{student.id}</div>
                    <div className="text-muted-foreground">
                      {student.course}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{student.section}</Badge>
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
        </main>
      </div>
    </div>
  );
};

export default FacultyStudents;
