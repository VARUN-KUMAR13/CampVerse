import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Eye, Upload, AlertCircle } from "lucide-react";

const StudentAssignments = () => {
  const { userData } = useAuth();
  const assignments = [
    {
      title: "Data Analysis Project",
      course: "Python for EDA",
      dueDate: "Due: 2025-03-15",
      status: "Overdue",
      files: 0,
      statusColor: "destructive",
    },
    {
      title: "Process Scheduling Implementation",
      course: "Operating Systems",
      dueDate: "Due: 2025-03-20",
      status: "Overdue",
      files: 0,
      statusColor: "destructive",
    },
    {
      title: "Algorithm Analysis Report",
      course: "Design & Analysis of Algorithms",
      dueDate: "Due: 2025-03-25",
      status: "Pending",
      files: 0,
      statusColor: "secondary",
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
              My Assignments
            </h1>
          </div>

          {/* Assignments List */}
          <div className="space-y-4">
            {assignments.map((assignment, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {assignment.course}
                      </p>
                      <div className="text-sm text-muted-foreground mb-4">
                        No description provided
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{assignment.dueDate}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <span>undefined</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <span>{assignment.files} files</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <AlertCircle className="w-4 h-4" />
                          <Badge
                            variant={assignment.statusColor as any}
                            className="text-xs"
                          >
                            {assignment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Submit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
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

export default StudentAssignments;
