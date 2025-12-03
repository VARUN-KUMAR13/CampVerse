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
          <Card>
            <CardHeader>
              <CardTitle>Student Attendence</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters and Attendance Button */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div className="flex gap-4 flex-1">
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Algorithms">Algorithms</SelectItem>
                      <SelectItem value="CSBS">CSBS</SelectItem>
                      <SelectItem value="DSA">Data Structures</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Section A</SelectItem>
                      <SelectItem value="B">Section B</SelectItem>
                      <SelectItem value="C">Section C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => setIsAttendanceMode(!isAttendanceMode)}
                  className="bg-blue-600 hover:bg-blue-700 text-white md:w-auto"
                >
                  Take Attendance
                </Button>
              </div>

              {/* Attendance Table */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-8 py-3 border-b text-sm font-medium text-muted-foreground">
                  <div>Roll Number</div>
                  <div>Status</div>
                  <div>Last Updated</div>
                </div>

                {students.map((student) => (
                  <div
                    key={student.id}
                    className="grid grid-cols-3 gap-8 py-3 items-center hover:bg-muted/30 rounded-lg transition-colors"
                  >
                    <div className="text-foreground font-medium">{student.id}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAttendanceStatus(student.id, "attended")}
                        className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <CheckCircle2
                          className={`w-5 h-5 ${
                            studentAttendance[student.id]?.status === "attended"
                              ? "text-green-500"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleAttendanceStatus(student.id, "not-attended")}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XCircle
                          className={`w-5 h-5 ${
                            studentAttendance[student.id]?.status === "not-attended"
                              ? "text-red-500"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleAttendanceStatus(student.id, null)}
                        className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Clock
                          className={`w-5 h-5 ${
                            studentAttendance[student.id]?.status === null
                              ? "text-gray-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {studentAttendance[student.id]?.lastUpdated || "Not marked"}
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
