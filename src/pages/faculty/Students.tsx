import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FacultySidebar from "@/components/FacultySidebar";
import FacultyTopbar from "@/components/FacultyTopbar";
import { Search, Eye, Download } from "lucide-react";
import { useState } from "react";

const FacultyStudents = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  const handleAttendanceStatus = (status) => {
    if (selectedStudent) {
      console.log(`Attendance for ${selectedStudent.name}: ${status}`);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <FacultySidebar />

      <div className="flex-1 flex flex-col">
        <FacultyTopbar />

        <main className="flex-1 p-6 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search students..." className="pl-10" />
            </div>
            <Button variant="outline" className="w-full md:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Export List
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Student Attendence</CardTitle>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(student)}
                      >
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Student: <span className="font-medium">{selectedStudent.name}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                ID: <span className="font-medium">{selectedStudent.id}</span>
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Select attendance status:</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => handleAttendanceStatus("Attended")}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Attended
                  </Button>
                  <Button
                    onClick={() => handleAttendanceStatus("Not Attended")}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Not Attended
                  </Button>
                  <Button
                    onClick={() => handleAttendanceStatus("Other")}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Other
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacultyStudents;
