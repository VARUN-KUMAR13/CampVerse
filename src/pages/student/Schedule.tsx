import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import { useAuth } from "@/contexts/AuthContext";

const StudentSchedule = () => {
  const { userData } = useAuth();
  const timeSlots = [
    "9:00 AM to 10:00 AM",
    "10:00 AM to 11:00 AM",
    "11:00 AM to 12:10 PM",
    "12:10 PM to 1:10 PM",
    "1:10 PM to 1:55 PM",
    "1:55 PM to 2:55 PM",
    "2:55 PM to 3:55 PM",
  ];

  const days = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  const schedule = {
    MONDAY: ["PE-lll", "DAA", "OS", "EDA", "", "RFP LAB (308 CM)", ""],
    TUESDAY: ["PSE", "SE LAB (305 CB)", "", "CS", "", "DAA", ""],
    WEDNESDAY: [
      "",
      "E-BOX LAB (203 MB) - Mr.B.Divya",
      "",
      "OS",
      "LUNCH",
      "LIB",
      "",
    ],
    THURSDAY: ["", "CS & EDA LAB (308 CM)", "", "PSE", "", "MENTORING", ""],
    FRIDAY: ["", "ALG & OS LAB (304CM)", "", "", "", "RFP LAB (308 CM)", ""],
    SATURDAY: ["CRT (110 CM)", "", "CS", "OS", "", "EDA", "SPORTS"],
  };

  const subjects = [
    {
      name: "Python for Exploratory Data Analysis",
      instructor: "Mr. D. Sujan Kumar (9849142916)",
    },
  ];

  const getClassColor = (subject: string) => {
    if (subject.includes("LAB"))
      return "bg-green-500/20 text-green-700 border-green-200";
    if (subject === "LUNCH")
      return "bg-orange-500/20 text-orange-700 border-orange-200";
    if (subject === "MENTORING")
      return "bg-purple-500/20 text-purple-700 border-purple-200";
    if (subject === "LIB")
      return "bg-blue-500/20 text-blue-700 border-blue-200";
    if (subject === "SPORTS")
      return "bg-red-500/20 text-red-700 border-red-200";
    if (subject === "CRT")
      return "bg-indigo-500/20 text-indigo-700 border-indigo-200";
    if (subject === "") return "bg-gray-100/20";
    return "bg-blue-500/20 text-blue-700 border-blue-200";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />

      <div className="flex-1 flex flex-col">
        <StudentTopbar studentId={userData?.collegeId || ""} />

        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Weekly Schedule
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {userData?.collegeId}
            </p>
          </div>

          {/* Schedule Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                SEC - CSE- B (Class Room - 303CB)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Class In-Charge: Dr. Baddepaka Prasad | W.E.F: 08/09/2025
              </p>
            </CardHeader>
          </Card>

          {/* Timetable */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left font-medium text-muted-foreground border-r">
                        DAY
                      </th>
                      {timeSlots.map((slot, index) => (
                        <th
                          key={index}
                          className="p-3 text-center font-medium text-muted-foreground border-r min-w-[120px]"
                        >
                          <div className="text-xs">{slot}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day, dayIndex) => (
                      <tr key={day} className="border-t">
                        <td className="p-3 font-medium text-foreground border-r bg-muted/30">
                          {day}
                        </td>
                        {schedule[day].map((subject, slotIndex) => (
                          <td key={slotIndex} className="p-2 border-r">
                            {subject && (
                              <div
                                className={`p-2 rounded text-xs text-center border ${getClassColor(
                                  subject,
                                )}`}
                              >
                                {subject}
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Subjects List */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">List of Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">
                      {index + 1}. {subject.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {subject.instructor}
                    </span>
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

export default StudentSchedule;
