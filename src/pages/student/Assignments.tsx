import { useState, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Eye, Upload, AlertCircle } from "lucide-react";

type AssignmentStatusVariant = "default" | "secondary" | "destructive" | "outline";

type Assignment = {
  title: string;
  course: string;
  dueDate: string;
  status: string;
  statusColor: AssignmentStatusVariant;
  description: string;
  uploadedFiles: File[];
};

const initialAssignments: Assignment[] = [
  {
    title: "Data Analysis Project",
    course: "Python for EDA",
    dueDate: "Due: 2025-03-15",
    status: "Overdue",
    statusColor: "destructive",
    description:
      "Analyze the quarterly retail dataset and submit an insights report supported by visualizations.",
    uploadedFiles: [],
  },
  {
    title: "Process Scheduling Implementation",
    course: "Operating Systems",
    dueDate: "Due: 2025-03-20",
    status: "Overdue",
    statusColor: "destructive",
    description:
      "Implement FCFS, SJF, and Round Robin CPU scheduling algorithms and document comparative results.",
    uploadedFiles: [],
  },
  {
    title: "Algorithm Analysis Report",
    course: "Design & Analysis of Algorithms",
    dueDate: "Due: 2025-03-25",
    status: "Pending",
    statusColor: "secondary",
    description:
      "Evaluate divide-and-conquer strategies for the provided problem set and compile an analytical report.",
    uploadedFiles: [],
  },
];

const formatFileSize = (size: number) => {
  if (!size) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.floor(Math.log(size) / Math.log(1024));
  const value = size / Math.pow(1024, exponent);
  return `${value.toFixed(2)} ${units[exponent]}`;
};

const buildFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

const StudentAssignments = () => {
  const { userData } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  const handleSubmitClick = (assignmentIndex: number) => {
    fileInputRefs.current[assignmentIndex]?.click();
  };

  const handleFileSelection = (
    assignmentIndex: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = event.target.files ? Array.from(event.target.files) : [];

    if (!selectedFiles.length) {
      event.target.value = "";
      return;
    }

    setAssignments((prevAssignments) => {
      const updatedAssignments = [...prevAssignments];
      const existingFiles = updatedAssignments[assignmentIndex].uploadedFiles;
      const mergedFiles = new Map<string, File>();

      [...existingFiles, ...selectedFiles].forEach((file) => {
        mergedFiles.set(buildFileKey(file), file);
      });

      updatedAssignments[assignmentIndex] = {
        ...updatedAssignments[assignmentIndex],
        uploadedFiles: Array.from(mergedFiles.values()),
      };

      return updatedAssignments;
    });

    toast({
      title: "Files selected",
      description: `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} ready for upload.`,
    });

    event.target.value = "";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />

      <div className="flex-1 flex flex-col">
        <StudentTopbar studentId={userData?.collegeId || ""} />

        <main className="flex-1 p-6 space-y-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">My Assignments</h1>
          </div>

          <div className="space-y-4">
            {assignments.map((assignment, index) => (
              <Card
                key={`${assignment.title}-${assignment.course}`}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {assignment.course}
                      </p>
                      <div className="text-sm text-muted-foreground mb-4">
                        {assignment.description}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{assignment.dueDate}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Upload className="w-4 h-4" />
                          <span>
                            {assignment.uploadedFiles.length > 0
                              ? `${assignment.uploadedFiles.length} file${assignment.uploadedFiles.length === 1 ? "" : "s"} selected`
                              : "No files uploaded yet"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <Badge variant={assignment.statusColor} className="text-xs">
                            {assignment.status}
                          </Badge>
                        </div>
                      </div>

                      {assignment.uploadedFiles.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-foreground mb-2">
                            Files ready for submission
                          </p>
                          <ul className="space-y-2">
                            {assignment.uploadedFiles.map((file) => (
                              <li
                                key={buildFileKey(file)}
                                className="flex items-center justify-between rounded-md border border-border bg-muted/60 px-3 py-2 text-sm"
                              >
                                <span className="truncate pr-4">{file.name}</span>
                                <span className="text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-stretch space-y-2 md:w-48">
                      <input
                        ref={(element) => {
                          fileInputRefs.current[index] = element;
                        }}
                        type="file"
                        className="hidden"
                        multiple
                        onChange={(event) => handleFileSelection(index, event)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSubmitClick(index)}
                        className="justify-center"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Submit
                      </Button>
                      <Button variant="outline" size="sm" className="justify-center">
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
