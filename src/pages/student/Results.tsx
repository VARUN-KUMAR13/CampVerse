import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, TrendingDown } from "lucide-react";

const StudentResults = () => {
  const { userData } = useAuth();
  const gradesData = [
    {
      subject: "Data Structures & Algorithms",
      grade: "A",
      percentage: 88,
      color: "bg-green-500",
    },
    {
      subject: "Database Management Systems",
      grade: "A+",
      percentage: 91,
      color: "bg-green-600",
    },
    {
      subject: "Business Analytics",
      grade: "B",
      percentage: 76,
      color: "bg-yellow-500",
    },
    {
      subject: "Operating Systems",
      grade: "C",
      percentage: 69,
      color: "bg-red-500",
    },
    {
      subject: "Web Development",
      grade: "A+",
      percentage: 95,
      color: "bg-green-600",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />

      <div className="flex-1 flex flex-col">
        <StudentTopbar studentId="23BB1A3235" />

        <main className="flex-1 p-6 space-y-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Results Summary
            </h1>
          </div>

          {/* Latest Grades Table */}
          <Card>
            <CardHeader>
              <CardTitle>Latest Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <p>No grades available yet</p>
              </div>
              <div className="grid grid-cols-5 gap-4 py-2 border-b text-sm font-medium text-muted-foreground">
                <div>Subject</div>
                <div>Assignment Type</div>
                <div>Term</div>
                <div>Marks</div>
                <div>Status</div>
              </div>
            </CardContent>
          </Card>

          {/* Grades Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Grades Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
                <div className="text-center">
                  <div className="h-40 w-full flex items-end justify-center space-x-8">
                    {/* Simple chart representation */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-32 bg-blue-500 rounded-t"></div>
                      <span className="text-xs mt-2">Oct</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-28 bg-blue-500 rounded-t"></div>
                      <span className="text-xs mt-2">Nov</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-30 bg-blue-500 rounded-t"></div>
                      <span className="text-xs mt-2">Dec</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-32 bg-blue-500 rounded-t"></div>
                      <span className="text-xs mt-2">Jan</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-28 bg-blue-500 rounded-t"></div>
                      <span className="text-xs mt-2">Feb</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-32 bg-blue-500 rounded-t"></div>
                      <span className="text-xs mt-2">Mar</span>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-xs">Your Grades</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-400 rounded"></div>
                      <span className="text-xs">Class Average</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Results Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {gradesData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {item.subject}
                    </div>
                  </div>
                  <div className="text-center min-w-[60px]">
                    <div className="text-lg font-bold text-foreground">
                      {item.grade}
                    </div>
                  </div>
                  <div className="text-center min-w-[80px]">
                    <div className="text-sm font-medium text-foreground">
                      {item.percentage}%
                    </div>
                  </div>
                  <div className="min-w-[120px]">
                    <div className={`h-2 ${item.color} rounded-full`}></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default StudentResults;
