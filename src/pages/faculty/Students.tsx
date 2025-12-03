import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FacultySidebar from "@/components/FacultySidebar";
import FacultyTopbar from "@/components/FacultyTopbar";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { useState } from "react";

const FacultyStudents = () => {
  const [selectedCourse, setSelectedCourse] = useState("Algorithms");
  const [selectedSection, setSelectedSection] = useState("A");
  const [isAttendanceMode, setIsAttendanceMode] = useState(false);

  const [studentAttendance, setStudentAttendance] = useState({
    "23BB1A3201": { status: "attended", lastUpdated: "4:51:55 PM" },
    "23BB1A3202": { status: "attended", lastUpdated: "4:51:56 PM" },
    "23BB1A3203": { status: null, lastUpdated: "Not marked" },
    "23BB1A3204": { status: null, lastUpdated: "Not marked" },
    "23BB1A3205": { status: null, lastUpdated: "Not marked" },
    "23BB1A3206": { status: null, lastUpdated: "Not marked" },
    "23BB1A3207": { status: null, lastUpdated: "Not marked" },
  });

  const students = [
    { id: "23BB1A3201", name: "INAPANURI ABHIJITH" },
    { id: "23BB1A3202", name: "SANDRI AKSHAINI" },
    { id: "23BB1A3203", name: "MUSKU AKSHAY" },
    { id: "23BB1A3204", name: "REVARTHI ANAND" },
    { id: "23BB1A3205", name: "ARJUN" },
    { id: "23BB1A3206", name: "KOMMU ASHWINI" },
    { id: "23BB1A3207", name: "MALE BALA KRISHNA REDDY" },
  ];

  const handleAttendanceStatus = (studentId, status) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    setStudentAttendance((prev) => ({
      ...prev,
      [studentId]: {
        status: status === studentAttendance[studentId]?.status ? null : status,
        lastUpdated:
          status === studentAttendance[studentId]?.status ? "Not marked" : timeString,
      },
    }));
  };

  const getStatusIcon = (studentId) => {
    const attendance = studentAttendance[studentId];
    if (!attendance || !attendance.status) {
      return (
        <button
          onClick={() => handleAttendanceStatus(studentId, "not-attended")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Clock className="w-5 h-5 text-gray-400" />
        </button>
      );
    }

    if (attendance.status === "attended") {
      return (
        <button
          onClick={() => handleAttendanceStatus(studentId, "attended")}
          className="p-2 hover:bg-green-50 rounded-lg transition-colors"
        >
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </button>
      );
    }

    return (
      <button
        onClick={() => handleAttendanceStatus(studentId, "not-attended")}
        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
      >
        <XCircle className="w-5 h-5 text-red-500" />
      </button>
    );
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
