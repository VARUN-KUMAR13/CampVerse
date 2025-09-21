import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useRef, useState } from "react";

const StudentSchedule = () => {
  const { userData } = useAuth();
  const [viewDay, setViewDay] = useState<string>("ALL");
  const [compact, setCompact] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  const subjectInfo: Record<string, { name: string; instructor?: string }> = {
    "LP": { name: "Linux Programming", instructor: "Dr. K. Karthik" },
    "BEFA": { name: "Business Economics & Financial Analysis", instructor: "Ms. P. Asifa Tazeen" },
    "CS": { name: "Cloud Security (PE-III)", instructor: "Ms. Sharmila Bandlamudi" },
    "BCT": { name: "Blockchain Technologies (PE-III)", instructor: "Dr. Baddepaka Prasad" },
    "NoSQL": { name: "NoSQL Databases (PE-III)", instructor: "Mr. B. Ashwin Kumar" },
    "DWDM": { name: "Data Warehousing & Data Mining (PE-IV)", instructor: "Dr. P. Madhavi" },
    "IOE": { name: "Internet of Everything (PE-IV)", instructor: "Dr. P. Kiran Kumar" },
    "PE-III": { name: "Professional Elective III" },
    "PE-IV": { name: "Professional Elective IV" },
    "BDAP": { name: "Big Data Analytics & Platforms Lab" },
    "VP": { name: "Visual Programming Lab" },
    "OE": { name: "Open Elective" },
    "Mentoring": { name: "Mentoring" },
    "CRT": { name: "Campus Recruitment Training" },
    "Project Work": { name: "Project Work Stage-I", instructor: "Ms. K. Sravani" },
    "Minor": { name: "Minor Course" },
    "Library": { name: "Library" },
    "SPORTS": { name: "Sports" },
  };

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

  const now = new Date();
  const currentDay = useMemo(() => now.toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase(), []);

  const parseTimeToMinutes = (t: string) => {
    const m = t.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) return null;
    let h = parseInt(m[1], 10) % 12;
    const minutes = parseInt(m[2], 10);
    const isPM = m[3].toUpperCase() === 'PM';
    if (isPM) h += 12;
    return h * 60 + minutes;
  };

  const slotRanges = useMemo(() => {
    return timeSlots.map((slot) => {
      const [start, end] = slot.split('to');
      return [parseTimeToMinutes(start || ''), parseTimeToMinutes(end || '')] as const;
    });
  }, [timeSlots]);

  const isCurrentSlot = (slotIndex: number) => {
    const mins = now.getHours() * 60 + now.getMinutes();
    const [s, e] = slotRanges[slotIndex] || [null, null];
    if (s == null || e == null) return false;
    return mins >= s && mins < e;
  };

  const filteredDays = viewDay === 'ALL' ? days : days.filter((d) => d === viewDay);

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />

      <div className="flex-1 flex flex-col">
        <StudentTopbar studentId={userData?.collegeId || ""} />

        <main className="flex-1 p-6" ref={containerRef}>
          {/* Header */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Weekly Schedule</h1>
              <p className="text-muted-foreground">Welcome back, {userData?.collegeId}</p>
            </div>
            <div className="flex gap-2">
              <select
                className="bg-background border rounded px-2 py-1 text-sm"
                value={viewDay}
                onChange={(e) => setViewDay(e.target.value)}
                aria-label="Filter by day"
              >
                <option value="ALL">All Days</option>
                {days.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <Button variant={compact ? "outline" : "default"} onClick={() => setCompact((v) => !v)}>
                {compact ? 'Comfortable' : 'Compact'}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  if (!containerRef.current) return;
                  const [{ default: html2canvas }, jsPDFModule] = await Promise.all([
                    import('html2canvas'),
                    import('jspdf'),
                  ]);
                  const jsPDFCtor: any = (jsPDFModule as any).jsPDF || (jsPDFModule as any).default;
                  const node = containerRef.current.querySelector('#timetable') as HTMLElement;
                  if (!node) return;
                  const canvas = await html2canvas(node as HTMLElement, { scale: 2, useCORS: true });
                  const imgData = canvas.toDataURL('image/png');
                  const pdf = new jsPDFCtor('l', 'mm', 'a4');
                  const pageWidth = pdf.internal.pageSize.getWidth();
                  const pageHeight = pdf.internal.pageSize.getHeight();
                  const margin = 6;
                  const imgWidth = pageWidth - margin * 2;
                  const imgHeight = (canvas.height * imgWidth) / canvas.width;
                  let heightLeft = imgHeight;
                  let position = margin;
                  pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
                  heightLeft -= pageHeight - margin * 2;
                  while (heightLeft > 0) {
                    pdf.addPage();
                    position = margin - (imgHeight - heightLeft);
                    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight - margin * 2;
                  }
                  pdf.save('schedule.pdf');
                }}
              >
                Export PDF
              </Button>
            </div>
          </div>

          {/* Schedule Info */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">SEC - CSE- B (Class Room - 303CB)</CardTitle>
              <p className="text-sm text-muted-foreground">Class In-Charge: Dr. Baddepaka Prasad | W.E.F: 08/09/2025</p>
            </CardHeader>
          </Card>

          {/* Legend */}
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge className="bg-green-500/20 text-green-700 border border-green-200" variant="outline">Lab</Badge>
            <Badge className="bg-cyan-500/20 text-cyan-700 border border-cyan-200" variant="outline">VP</Badge>
            <Badge className="bg-indigo-500/20 text-indigo-700 border border-indigo-200" variant="outline">CRT</Badge>
            <Badge className="bg-yellow-500/20 text-yellow-700 border border-yellow-200" variant="outline">Minor</Badge>
            <Badge className="bg-teal-500/20 text-teal-700 border border-teal-200" variant="outline">Project</Badge>
            <Badge className="bg-orange-500/20 text-orange-700 border border-orange-200" variant="outline">Lunch</Badge>
            <Badge className="bg-blue-500/20 text-blue-700 border border-blue-200" variant="outline">Library</Badge>
          </div>

          {/* Timetable */}
          <Card id="timetable">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className={`w-full ${compact ? 'text-xs' : ''}`}>
                  <thead className="bg-muted/50 sticky top-0 z-10">
                    <tr>
                      <th className="p-3 text-left font-medium text-muted-foreground border-r sticky left-0 bg-muted/50 z-10">
                        DAY
                      </th>
                      {timeSlots.map((slot, index) => (
                        <th key={index} className="p-3 text-center font-medium text-muted-foreground border-r min-w-[140px]">
                          <div className="text-xs">{slot}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDays.map((day) => (
                      <tr key={day} className="border-t">
                        <td className="p-3 font-medium text-foreground border-r bg-muted/30 sticky left-0 z-10">
                          {day}
                          {day === currentDay && <span className="ml-2 text-xs text-primary">(Today)</span>}
                        </td>
                        {schedule[day].map((subject, slotIndex) => (
                          <td key={slotIndex} className={`p-2 border-r ${day === currentDay && isCurrentSlot(slotIndex) ? 'bg-primary/5' : ''}`}>
                            {subject && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className={`rounded ${compact ? 'p-1' : 'p-2'} text-center border ${getClassColor(subject)}`}>
                                      {subject}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="space-y-1">
                                      <div className="font-medium text-foreground">{subjectInfo[Object.keys(subjectInfo).find(k => subject.includes(k)) || '']?.name || subject}</div>
                                      {subjectInfo[Object.keys(subjectInfo).find(k => subject.includes(k)) || '']?.instructor && (
                                        <div className="text-xs text-muted-foreground">{subjectInfo[Object.keys(subjectInfo).find(k => subject.includes(k)) || '']?.instructor}</div>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
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
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{index + 1}. {subject.name}</span>
                    <span className="text-sm text-muted-foreground">{subject.instructor}</span>
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
