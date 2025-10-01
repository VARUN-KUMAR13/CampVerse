import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FacultySidebar from "@/components/FacultySidebar";
import FacultyTopbar from "@/components/FacultyTopbar";
import { BookOpen, Users, FileText, Calendar, Clock } from "lucide-react";

const FacultyDashboard = () => {
  const stats = [
    {
      label: "Active Classes",
      value: "4",
      icon: <BookOpen className="w-5 h-5" />,
      color: "text-red-500",
    },
    {
      label: "Total Students",
      value: "45",
      icon: <Users className="w-5 h-5" />,
      color: "text-green-500",
    },
    {
      label: "Lab Sessions",
      value: "4",
      icon: <FileText className="w-5 h-5" />,
      color: "text-blue-500",
    },
    {
      label: "Upcoming Events",
      value: "3",
      icon: <Calendar className="w-5 h-5" />,
      color: "text-purple-500",
    },
  ];

  const upcomingEvents = [
    {
      date: "15",
      month: "FEB",
      title: "Mid-Term Examinations Begin",
      time: "Duration: Feb 15 - Feb 23, 2025",
      type: "Exams",
      color: "text-blue-500",
    },
    {
      date: "26",
      month: "FEB",
      title: "Lab Assessment Week",
      time: "Practical evaluations for all lab courses",
      type: "Labs",
      color: "text-orange-500",
    },
  ];

  const activeCourses = [
    {
      code: "CS001",
      name: "Python for EDA",
      instructor: "Dr. D. Sujan Kumar",
      students: 45,
      status: "active",
      color: "bg-blue-500",
    },
    {
      code: "CS002",
      name: "Operating Systems",
      instructor: "G.Deepika",
      students: 38,
      status: "active",
      color: "bg-green-500",
    },
    {
      code: "CS003",
      name: "Design & Analysis of Algorithms",
      instructor: "Dr. M. Raghava",
      students: 42,
      status: "active",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <FacultySidebar />

      <div className="flex-1 flex flex-col">
        <FacultyTopbar />

        <main className="flex-1 p-6 space-y-6">
          {/* Welcome Section */}
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Welcome, 👋
            </h1>
            <p className="text-muted-foreground">
              Here's your teaching overview for today!
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                    <div className={`${stat.color}`}>{stat.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {event.date}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {event.month}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {event.title}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {event.time}
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Active Courses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Active Courses</CardTitle>
                  <Badge variant="outline">View All</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeCourses.map((course, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg"
                  >
                    <div
                      className={`w-12 h-12 ${course.color} rounded-lg flex items-center justify-center text-white font-bold`}
                    >
                      {course.code}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {course.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <Users className="w-4 h-4 inline mr-1" />
                        {course.students} Students
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-muted-foreground">
                        active
                      </span>
                    </div>
                    <Badge variant="outline">View Details</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;
