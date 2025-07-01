import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, MapPin } from "lucide-react";

const StudentExams = () => {
  const examFilters = ["All", "This Week", "This Month"];

  const upcomingExams = [
    {
      date: "15th",
      month: "Feb",
      subject: "Data Structures & Algorithms",
      time: "9:00 AM - 12:00 PM",
      hall: "Examination Hall I",
    },
    {
      date: "18th",
      month: "Feb",
      subject: "Database Management Systems",
      time: "9:00 AM - 12:00 PM",
      hall: "Examination Hall I",
    },
    {
      date: "21st",
      month: "Feb",
      subject: "Business Analytics",
      time: "9:00 AM - 12:00 PM",
      hall: "Examination Hall I",
    },
    {
      date: "24th",
      month: "Feb",
      subject: "Operating Systems",
      time: "9:00 AM - 12:00 PM",
      hall: "Examination Hall I",
    },
    {
      date: "27th",
      month: "Feb",
      subject: "Web Development",
      time: "9:00 AM - 12:00 PM",
      hall: "Examination Hall I",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />

      <div className="flex-1 flex flex-col">
        <StudentTopbar studentId="23BB1A3235" />

        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Upcoming Exams
            </h1>

            {/* Filter Tabs */}
            <div className="flex space-x-2">
              {examFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant={index === 0 ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {filter}
                </Badge>
              ))}
            </div>
          </div>

          {/* Exams Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {upcomingExams.map((exam, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Date Circle */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary rounded-full flex flex-col items-center justify-center text-primary-foreground">
                        <div className="text-lg font-bold">{exam.date}</div>
                        <div className="text-xs">{exam.month}</div>
                      </div>
                    </div>

                    {/* Exam Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {exam.subject}
                      </h3>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{exam.time}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{exam.hall}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentExams;
