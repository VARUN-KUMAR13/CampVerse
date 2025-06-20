import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import FacultySidebar from "@/components/FacultySidebar";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";

const FacultyAssignments = () => {
  const assignments = [
    {
      title: "Data Analysis Project",
      course: "Python for EDA",
      dueDate: "2025-03-15",
      submissions: 45,
      status: "Completed",
      statusColor: "bg-green-500",
    },
    {
      title: "Process Scheduling Implementation",
      course: "Operating Systems",
      dueDate: "2025-03-20",
      submissions: 45,
      status: "Completed",
      statusColor: "bg-green-500",
    },
    {
      title: "Algorithm Analysis Report",
      course: "Design & Analysis of Algorithms",
      dueDate: "2025-03-25",
      submissions: 45,
      status: "Completed",
      statusColor: "bg-green-500",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <FacultySidebar />

      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search assignments..."
                  className="pl-10 w-64"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-medium text-foreground">
                  D. Sujan Kumar
                </div>
                <div className="text-sm text-muted-foreground">
                  Faculty ID: DSK001
                </div>
              </div>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                DS
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Assignment Management
            </h1>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {/* Assignments Table */}
              <div className="space-y-1">
                <div className="grid grid-cols-6 gap-4 p-4 border-b text-sm font-medium text-muted-foreground bg-muted/30">
                  <div>Assignment</div>
                  <div>Due Date</div>
                  <div>Submissions</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>

                {assignments.map((assignment, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-muted/20 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-foreground">
                        {assignment.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {assignment.course}
                      </div>
                    </div>
                    <div className="text-muted-foreground">
                      {assignment.dueDate}
                    </div>
                    <div className="text-muted-foreground">
                      {assignment.submissions} submissions
                    </div>
                    <div>
                      <Badge className="bg-green-500 text-white">
                        {assignment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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

export default FacultyAssignments;
