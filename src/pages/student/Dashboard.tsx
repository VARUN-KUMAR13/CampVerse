import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import {
  Clock,
  Users,
  BarChart3,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useState } from "react";

const StudentDashboard = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const stats = [
    {
      label: "Current Semester",
      value: "IV",
      icon: <BarChart3 className="w-4 h-4" />,
      color: "text-orange-500",
    },
    {
      label: "Subjects",
      value: "9",
      icon: <Users className="w-4 h-4" />,
      color: "text-green-500",
    },
    {
      label: "Labs",
      value: "4",
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
      subject: "CS & EDA LAB",
      code: "CSEDA101",
      status: "Not Marked",
    },
    {
      time: "12:10 PM - 1:10 PM",
      subject: "Python for EDA",
      code: "EDA101",
      status: "Not Marked",
    },
    {
      time: "1:55 PM - 2:55 PM",
      subject: "Software Engineering",
      code: "PSE01",
      status: "Not Marked",
    },
    {
      time: "2:55 PM - 3:55 PM",
      subject: "Mentoring",
      code: "MEN01",
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
      date: "21.02.2025 to 24.02.2025",
      title: "I Mid Examinations",
      timeLeft: "3 Days",
      color: "bg-blue-500",
    },
    {
      date: "24.04.2025 to 30.04.2025",
      title: "II Mid Examinations",
      timeLeft: "3 Days",
      color: "bg-purple-500",
    },
    {
      date: "08.06.2025 to 19.06.2025",
      title: "Semester End Examinations",
      timeLeft: "2 Weeks",
      color: "bg-red-500",
    },
    {
      date: "01.05.2025 to 31.05.2025",
      title: "Summer Vacation",
      timeLeft: "1 Month",
      color: "bg-green-500",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />

      <div className="flex-1 flex flex-col">
        <StudentTopbar studentId="23BB1A3235" currentTime="4:21:17 PM" />

        <main className="flex-1 p-6 space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Hello 23BB1A3235 <span className="text-2xl">👋</span>
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
                <span className="text-sm text-muted-foreground">
                  4:21:17 PM
                </span>
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
