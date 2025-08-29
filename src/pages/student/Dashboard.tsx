import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  Clock,
  Users,
  BarChart3,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useState } from "react";

const StudentDashboard = () => {
  const { userData } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const stats = [
    {
      label: "Current Semester",
      value: "VII",
      icon: <BarChart3 className="w-4 h-4" />,
      color: "text-orange-500",
    },
    {
      label: "Subjects",
      value: "5",
      icon: <Users className="w-4 h-4" />,
      color: "text-green-500",
    },
    {
      label: "Labs",
      value: "3",
      icon: <CalendarIcon className="w-4 h-4" />,
      color: "text-blue-500",
    },
    {
      label: "Faculty",
      value: "12",
      icon: <Users className="w-4 h-4" />,
      color: "text-purple-500",
    },
  ];

  const todaysSchedule = [
    {
      time: "9:00 AM - 12:10 PM",
      subject: "Linux programming",
      code: "22CS401",
      status: "Not Marked",
    },
    {
      time: "12:10 PM - 1:10 PM",
      subject: "Business Economics and Financial Analysis",
      code: "22HS301",
      status: "Not Marked",
    },
    {
      time: "1:55 PM - 2:55 PM",
      subject: "Professional Elective-lll",
      code: "22HS501",
      status: "Not Marked",
    },
    {
      time: "2:55 PM - 3:55 PM",
      subject: "Professional Elective-lV",
      code: "22HS601",
      status: "Not Marked",
    },
  ];

  const performanceMetrics = [
    {
      label: "Overall Attendance",
      value: 85,
      color: "bg-blue-500",
    },
    {
      label: "Average Grade",
      value: 78,
      color: "bg-green-500",
    },
  ];

  const upcomingEvents = [
    {
      date: "16.06.2025",
      title: "Commencement of Classwork",
      timeLeft: "Starts",
      color: "bg-green-500",
    },
    {
      date: "16.06.2025 to 19.08.2025",
      title: "1st Spell of Instruction/Classwork",
      timeLeft: "9 Weeks",
      color: "bg-emerald-500",
    },
    {
      date: "20.08.2025 to 23.08.2025",
      title: "I Mid Examinations",
      timeLeft: "4 Days",
      color: "bg-blue-500",
    },
    {
      date: "25.08.2025 to 21.10.2025",
      title: "2nd Spell of Instruction/Classwork",
      timeLeft: "8 Weeks",
      color: "bg-emerald-500",
    },
    {
      date: "03.10.2025 to 04.10.2025",
      title: "Dussehra Holidays",
      timeLeft: "2 Days",
      color: "bg-yellow-500",
    },
    {
      date: "22.10.2025 to 25.10.2025",
      title: "II Mid Examinations",
      timeLeft: "4 Days",
      color: "bg-purple-500",
    },
    {
      date: "27.10.2025 to 01.11.2025",
      title: "Practical Exams & Preparation Holidays",
      timeLeft: "1 Week",
      color: "bg-indigo-500",
    },
    {
      date: "03.11.2025 to 17.11.2025",
      title: "Semester End Examinations (Main) & Supplementary",
      timeLeft: "2 Weeks",
      color: "bg-red-500",
    },
    {
      date: "20.11.2025",
      title: "Commencement of IV B.Tech. II Sem. AY 2025-26",
      timeLeft: "Starts",
      color: "bg-green-600",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />

      <div className="flex-1 flex flex-col">
        <StudentTopbar studentId={userData?.collegeId || ""} />

        <main className="flex-1 p-6 space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Hello {userData?.collegeId} <span className="text-2xl">👋</span>
            </h1>
            <p className="text-muted-foreground">
              Let's learn something new today!
            </p>
          </div>

          {/* Today's Schedule & Attendance */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today's Schedule & Attendance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysSchedule.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {item.subject}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.code}
                      </div>
                    </div>
                    <div className="text-center mx-4">
                      <div className="text-sm text-muted-foreground">
                        {item.time}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="p-4">
                      <div className={`text-2xl font-bold ${stat.color} mb-2`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-foreground">{metric.label}</span>
                        <span className="font-medium">{metric.value}%</span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Calendar & Events */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">May 2025</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Academic Calendar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingEvents.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${event.color}`}
                      ></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">
                          {event.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.date}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {event.timeLeft}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
