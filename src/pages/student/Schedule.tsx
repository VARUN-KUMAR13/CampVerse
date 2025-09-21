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
    MONDAY: [
      "PE-III",
      "BCT - 303 CB | CS - 305 CB | NoSQL - 306 CB",
      "VP Class",
      "PE-III(T) | BCT - 303 CB | CS - 305 CB | NoSQL - 306 CB",
      "LUNCH",
      "VP Lab (Old Cellar)",
      "",
    ],
    TUESDAY: [
      "BDAP Lab (112 CB)",
      "",
      "BDAP Lab (112 CB)",
      "OE/ Mentoring (206 CM)",
      "LUNCH",
      "CRT/BEFA(T)",
      "CRT/Lib",
    ],
    WEDNESDAY: [
      "PE-IV",
      "IOE - 303 CB | DWDM - 304 CB",
      "LP",
      "BCT - 303 CB | CS - 305 CB | NoSQL - 306 CB",
      "Minor/LP(T)",
      "",
      "",
    ],
    THURSDAY: [
      "BEFA",
      "LP",
      "",
      "Project Work (303 CB) (Ms.K Sravani)",
      "Project Work (303 CB) (Ms.K Sravani)",
      "",
      "",
    ],
    FRIDAY: [
      "LP",
      "BEFA",
      "",
      "Minor/Library",
      "",
      "CRT/PE-IV(T) IOE - 303 CB DWDM - 304 CB",
      "CRT/Mentoring (303CB)",
    ],
    SATURDAY: [
      "PE-III",
      "BCT - 303 CB | CS - 305 CB | NoSQL - 112 CB",
      "PE-IV",
      "IOE - 303 CB | DWDM - 304 CB",
      "OE/LP(T)",
      "Minor Lab/Projects (303 CB) (Ms.G.Malleswari)",
      "Minor Lab/Sports",
    ],
  };

  const subjects = [
    { name: "Linux Programming", instructor: "Dr. K. Karthik" },
    { name: "Business Economics & Financial Analysis", instructor: "Ms. P. Asifa Tazeen" },
    { name: "Cloud Security - Professional Elective: III", instructor: "Ms. Sharmila Bandlamudi" },
    { name: "Blockchain Technologies - Professional Elective: III", instructor: "Dr. Baddepaka Prasad" },
    { name: "NoSQL Databases - Professional Elective: III", instructor: "Mr. B. Ashwin Kumar" },
    { name: "Data Warehousing and Data Mining - Professional Elective: IV", instructor: "Dr. P. Madhavi" },
    { name: "Internet of Everything - Professional Elective: IV", instructor: "Dr. P. Kiran Kumar" },
    { name: "Disaster Preparedness, Planning and Management - Open Elective: I", instructor: "Mr. K. Mahesh" },
    { name: "Environmental Impact Assessment - Open Elective: I", instructor: "Dr. R. Karthik" },
    { name: "Professional Skills for Engineers - Open Elective: I", instructor: "Dr. T. Hymavathi" },
    { name: "Essentials of Anatomy and Physiology - Open Elective: I", instructor: "Dr. K. T. Padma Priya" },
    { name: "Entrepreneurship - Open Elective: I", instructor: "Mr. P. V. S. H. Sastry" },
    { name: "Big Data Analytics and Platforms Lab", instructor: "Ms. Sheshrieka, Ms. S. Bhavani, Mr. R. Sathya Prakash" },
    { name: "Visual Programming Lab", instructor: "Dr. Baddepaka Prasad, Mr. T. Rama Rao, Ms. T. Jyothi" },
    { name: "Project Work Stage-I", instructor: "Ms. K. Sravani (Coordinator)" },
  ];

  const getClassColor = (subject: string) => {
    const s = subject.toUpperCase();
    if (s.includes("LAB")) return "bg-green-500/20 text-green-700 border-green-200";
    if (s.includes("LUNCH")) return "bg-orange-500/20 text-orange-700 border-orange-200";
    if (s.includes("MENTOR")) return "bg-purple-500/20 text-purple-700 border-purple-200";
    if (s.includes("LIB")) return "bg-blue-500/20 text-blue-700 border-blue-200";
    if (s.includes("SPORT")) return "bg-red-500/20 text-red-700 border-red-200";
    if (s.includes("CRT")) return "bg-indigo-500/20 text-indigo-700 border-indigo-200";
    if (s.includes("PROJECT")) return "bg-teal-500/20 text-teal-700 border-teal-200";
    if (s.includes("VP")) return "bg-cyan-500/20 text-cyan-700 border-cyan-200";
    if (s.includes("MINOR")) return "bg-yellow-500/20 text-yellow-700 border-yellow-200";
    if (subject.trim() === "") return "bg-gray-100/20";
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
