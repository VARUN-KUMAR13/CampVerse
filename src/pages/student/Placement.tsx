import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import { useAuth } from "@/contexts/AuthContext";
import { usePlacement } from "@/contexts/PlacementContext";
import {
  Search,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  ExternalLink,
} from "lucide-react";

const StudentPlacement = () => {
  const { userData } = useAuth();
  const { jobs: placementData, applyToJob, addJob } = usePlacement();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Debug logging
  console.log("Student Placement - All jobs:", placementData);
  console.log("Student Placement - Job count:", placementData.length);

  useEffect(() => {
    console.log("Jobs updated in Student Placement:", placementData);
  }, [placementData]);

  const filteredJobs = placementData.filter((job) => {
    const matchesSearch =
      searchTerm === "" ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      jobTypeFilter === "all" ||
      (jobTypeFilter === "internship" &&
        job.type.toLowerCase().includes("intern")) ||
      (jobTypeFilter === "fulltime" && job.type.toLowerCase().includes("full"));
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "eligible" && job.eligible && !job.applied) ||
      (statusFilter === "applied" && job.applied) ||
      (statusFilter === "closed" && job.status === "Closed");

    console.log(`Job ${job.job_id}:`, {
      matchesSearch,
      matchesType,
      matchesStatus,
      job: job,
    });

    return matchesSearch && matchesType && matchesStatus;
  });

  // Debug logging for filtered jobs
  console.log("Filtered jobs:", filteredJobs);
  console.log("Filtered jobs count:", filteredJobs.length);
  console.log("Search term:", searchTerm);
  console.log("Job type filter:", jobTypeFilter);
  console.log("Status filter:", statusFilter);

  const getStatusBadge = (job: any) => {
    if (job.status === "Closed") {
      return <Badge variant="destructive">Closed</Badge>;
    }
    if (job.applied) {
      return <Badge className="bg-blue-500">Applied</Badge>;
    }
    if (job.eligible) {
      return <Badge className="bg-green-500">Eligible</Badge>;
    }
    return <Badge variant="secondary">Not Eligible</Badge>;
  };

  const formatDeadline = (deadline: string) => {
    return new Date(deadline).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApply = (jobId: string) => {
    if (userData?.collegeId) {
      applyToJob(jobId, userData.collegeId);
    }
  };

  const testAddJob = () => {
    addJob({
      job_id: `TEST${Date.now()}`,
      title: "Test Job from Student",
      company: "Test Company",
      type: "Full Time",
      ctc: "5.00 LPA",
      stipend: "N/A",
      deadline: "2025-12-31T23:59:00",
      eligibility: ["All Branches"],
      description: "This is a test job added from student dashboard",
      bond: "2 years",
      rounds: ["Online Test", "Interview"],
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <div className="flex-1 flex flex-col">
        <StudentTopbar studentId={userData?.collegeId || ""} />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Building2 className="w-8 h-8 text-primary" />
                  Placement Opportunities
                </h1>
                <p className="text-muted-foreground mt-1">
                  Explore job opportunities and internships posted by companies
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={testAddJob}
                  className="text-sm bg-blue-500 text-white"
                >
                  🧪 Test Add Job
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="text-sm"
                >
                  🔄 Refresh
                </Button>
                <div className="text-sm text-muted-foreground">
                  Total Jobs: {placementData.length} | Filtered:{" "}
                  {filteredJobs.length}
                </div>
              </div>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search by company or job title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select
                    value={jobTypeFilter}
                    onValueChange={setJobTypeFilter}
                  >
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="fulltime">Full Time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="eligible">Eligible</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Job Listings */}
            <div className="grid gap-6">
              {filteredJobs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No opportunities found
                    </h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters to see more results.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredJobs.map((job) => (
                  <Card
                    key={job.job_id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-foreground">
                                {job.title}
                              </h3>
                              <p className="text-lg text-primary font-medium">
                                {job.company}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{job.type}</Badge>
                            {getStatusBadge(job)}
                            <Badge variant="secondary">ID: {job.job_id}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Deadline
                          </p>
                          <p className="font-medium text-destructive flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDeadline(job.deadline)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{job.description}</p>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="font-medium">CTC:</span>
                            <span>{job.ctc}</span>
                          </div>
                          {job.stipend !== "N/A" && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-blue-500" />
                              <span className="font-medium">Stipend:</span>
                              <span>{job.stipend}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Bond:</span>
                            <span>{job.bond}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">Eligibility:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {job.eligibility.map((branch) => (
                                <Badge
                                  key={branch}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {branch}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">
                              Selection Rounds:
                            </span>
                            <ul className="text-sm text-muted-foreground mt-1">
                              {Array.isArray(job.rounds)
                                ? job.rounds.map((round, index) => (
                                    <li key={index}>• {round}</li>
                                  ))
                                : job.rounds && <li>• {job.rounds}</li>}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex gap-2">
                          {job.attachments.map((file) => (
                            <Button key={file} variant="outline" size="sm">
                              <FileText className="w-4 h-4 mr-2" />
                              {file}
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {job.eligible &&
                            !job.applied &&
                            job.status !== "Closed" && (
                              <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApply(job.job_id)}
                              >
                                Apply Now
                              </Button>
                            )}
                          <Button variant="outline">View Details</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentPlacement;
