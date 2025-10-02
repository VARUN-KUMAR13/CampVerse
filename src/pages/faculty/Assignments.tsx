import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import FacultySidebar from "@/components/FacultySidebar";
import FacultyTopbar from "@/components/FacultyTopbar";
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
        <FacultyTopbar />

        <main className="flex-1 p-6 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-foreground">
              Assignment Management
            </h1>
            <div className="flex flex-col gap-3 w-full md:w-auto md:flex-row md:items-center">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search assignments..." className="pl-10" />
              </div>
              <Button className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </div>
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
