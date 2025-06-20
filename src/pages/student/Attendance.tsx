import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";

const StudentAttendance = () => {
  const attendanceData = [
    {
      subject: "Data Structures & Algorithms",
      percentage: 85,
      status: "Satisfactory",
      color: "bg-green-500",
    },
    {
      subject: "Database Management Systems",
      percentage: 90,
      status: "Satisfactory",
      color: "bg-green-500",
    },
    {
      subject: "Business Analytics",
      percentage: 75,
      status: "Satisfactory",
      color: "bg-green-500",
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
              Attendance Summary
            </h1>
          </div>

          {/* Attendance Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
                <div className="text-center">
                  <div className="h-40 w-full flex items-end justify-center space-x-8">
                    {/* Chart representation */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-36 bg-blue-500 rounded-t"></div>
                      <span className="text-xs mt-2">Oct</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-32 bg-blue-500 rounded-t"></div>
                      <span className="text-xs mt-2">Nov</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-34 bg-blue-500 rounded-t"></div>
                      <span className="text-xs mt-2">Dec</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-36 bg-blue-500 rounded-t"></div>
                      <span className="text-xs mt-2">Jan</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-32 bg-blue-500 rounded-t"></div>
                      <span className="text-xs mt-2">Feb</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-36 bg-blue-500 rounded-t"></div>
                      <span className="text-xs mt-2">Mar</span>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-xs">Your Attendance</span>
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

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {attendanceData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {item.subject}
                    </div>
                  </div>
                  <div className="text-center min-w-[80px]">
                    <div className="text-lg font-bold text-foreground">
                      {item.percentage}%
                    </div>
                  </div>
                  <div className="text-center min-w-[100px]">
                    <div className="text-sm text-green-600 font-medium">
                      {item.status}
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

export default StudentAttendance;
