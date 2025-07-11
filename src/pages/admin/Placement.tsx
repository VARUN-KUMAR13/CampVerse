import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { usePlacement } from "@/contexts/PlacementContext";
import {
  Plus,
  Building2,
  Calendar,
  Users,
  DollarSign,
  Edit,
  Trash2,
  FileText,
  Upload,
  Eye,
} from "lucide-react";

const AdminPlacement = () => {
  const { userData } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

  const placementJobs = [
    {
      job_id: "APT2025",
      title: "Technical Consultant I",
      company: "apty",
      type: "Intern + Full Time",
      ctc: "5.00 LPA - 8.00 LPA",
      stipend: "₹25,000/month",
      deadline: "2025-07-05T10:00:00",
      status: "Open",
      eligibility: ["CSE", "IT", "ECE"],
      appliedCount: 45,
      shortlistedCount: 12,
      selectedCount: 0,
      postedDate: "2025-01-20T10:00:00",
      attachments: ["CVR_APTY_Proposal.pdf"],
    },
    {
      job_id: "TCS2025",
      title: "Assistant System Engineer",
      company: "TCS",
      type: "Full Time",
      ctc: "3.36 LPA",
      stipend: "N/A",
      deadline: "2025-06-15T23:59:00",
      status: "Open",
      eligibility: ["All Branches"],
      appliedCount: 156,
      shortlistedCount: 45,
      selectedCount: 8,
      postedDate: "2025-01-15T09:00:00",
      attachments: ["TCS_JD.pdf"],
    },
    {
      job_id: "WIPRO2025",
      title: "Project Engineer",
      company: "Wipro",
      type: "Full Time",
      ctc: "4.50 LPA",
      stipend: "N/A",
      deadline: "2025-05-20T18:00:00",
      status: "Closed",
      eligibility: ["CSE", "IT"],
      appliedCount: 89,
      shortlistedCount: 25,
      selectedCount: 15,
      postedDate: "2025-01-10T14:00:00",
      attachments: ["Wipro_Details.pdf"],
    },
  ];

  const [jobs, setJobs] = useState(placementJobs);
  const [newJob, setNewJob] = useState({
    job_id: "",
    title: "",
    company: "",
    type: "",
    ctc: "",
    stipend: "",
    deadline: "",
    eligibility: [],
    description: "",
    bond: "",
    rounds: "",
  });

  const handleAddJob = () => {
    const job = {
      ...newJob,
      status: "Open",
      appliedCount: 0,
      shortlistedCount: 0,
      selectedCount: 0,
      postedDate: new Date().toISOString(),
      attachments: [],
    };
    setJobs([job, ...jobs]);
    setNewJob({
      job_id: "",
      title: "",
      company: "",
      type: "",
      ctc: "",
      stipend: "",
      deadline: "",
      eligibility: [],
      description: "",
      bond: "",
      rounds: "",
    });
    setIsAddModalOpen(false);
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(jobs.filter((job) => job.job_id !== jobId));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open":
        return <Badge className="bg-green-500">Open</Badge>;
      case "Closed":
        return <Badge variant="destructive">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-8 h-8 text-primary" />
                Placement Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage job opportunities and placement drives
              </p>
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Job Opportunity</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Job ID</label>
                      <Input
                        value={newJob.job_id}
                        onChange={(e) =>
                          setNewJob({ ...newJob, job_id: e.target.value })
                        }
                        placeholder="e.g., APT2025"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Company</label>
                      <Input
                        value={newJob.company}
                        onChange={(e) =>
                          setNewJob({ ...newJob, company: e.target.value })
                        }
                        placeholder="Company name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Job Title</label>
                    <Input
                      value={newJob.title}
                      onChange={(e) =>
                        setNewJob({ ...newJob, title: e.target.value })
                      }
                      placeholder="Job title"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Job Type</label>
                      <Select
                        value={newJob.type}
                        onValueChange={(value) =>
                          setNewJob({ ...newJob, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full Time">Full Time</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                          <SelectItem value="Intern + Full Time">
                            Intern + Full Time
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">CTC</label>
                      <Input
                        value={newJob.ctc}
                        onChange={(e) =>
                          setNewJob({ ...newJob, ctc: e.target.value })
                        }
                        placeholder="e.g., 5.00 LPA - 8.00 LPA"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Stipend</label>
                      <Input
                        value={newJob.stipend}
                        onChange={(e) =>
                          setNewJob({ ...newJob, stipend: e.target.value })
                        }
                        placeholder="e.g., ₹25,000/month or N/A"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Deadline</label>
                      <Input
                        type="datetime-local"
                        value={newJob.deadline}
                        onChange={(e) =>
                          setNewJob({ ...newJob, deadline: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newJob.description}
                      onChange={(e) =>
                        setNewJob({ ...newJob, description: e.target.value })
                      }
                      placeholder="Job description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Bond Period</label>
                      <Input
                        value={newJob.bond}
                        onChange={(e) =>
                          setNewJob({ ...newJob, bond: e.target.value })
                        }
                        placeholder="e.g., 2 years"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Selection Rounds
                      </label>
                      <Input
                        value={newJob.rounds}
                        onChange={(e) =>
                          setNewJob({ ...newJob, rounds: e.target.value })
                        }
                        placeholder="e.g., Written, Technical, HR"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddJob}>Add Job</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Jobs</p>
                    <p className="text-2xl font-bold">{jobs.length}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Jobs</p>
                    <p className="text-2xl font-bold">
                      {jobs.filter((job) => job.status === "Open").length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Applications
                    </p>
                    <p className="text-2xl font-bold">
                      {jobs.reduce((sum, job) => sum + job.appliedCount, 0)}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Placements</p>
                    <p className="text-2xl font-bold">
                      {jobs.reduce((sum, job) => sum + job.selectedCount, 0)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Jobs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Job Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card key={job.job_id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {job.title}
                            </h3>
                            <p className="text-primary font-medium">
                              {job.company}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{job.type}</Badge>
                          {getStatusBadge(job.status)}
                          <Badge variant="secondary">ID: {job.job_id}</Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteJob(job.job_id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">CTC</p>
                        <p className="font-medium">{job.ctc}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Deadline
                        </p>
                        <p className="font-medium">
                          {formatDate(job.deadline)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Applications
                        </p>
                        <div className="flex gap-2 text-sm">
                          <span className="text-blue-600">
                            {job.appliedCount} Applied
                          </span>
                          <span className="text-green-600">
                            {job.selectedCount} Selected
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Eligibility
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {job.eligibility.slice(0, 2).map((branch) => (
                            <Badge
                              key={branch}
                              variant="outline"
                              className="text-xs"
                            >
                              {branch}
                            </Badge>
                          ))}
                          {job.eligibility.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{job.eligibility.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPlacement;
