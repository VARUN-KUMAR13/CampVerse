import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { usePlacement } from "@/contexts/PlacementContext";
import { useToast } from "@/hooks/use-toast";
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
  RefreshCw,
  Loader2,
  X,
  Link,
  Clock,
} from "lucide-react";

interface AttachedFile {
  name: string;
  url: string;
  type: "local" | "drive";
  size?: number;
}

const AdminPlacement = () => {
  const { userData } = useAuth();
  const { jobs, loading, error, addJob, deleteJob, refreshJobs } = usePlacement();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [driveLink, setDriveLink] = useState("");
  const [showDriveLinkInput, setShowDriveLinkInput] = useState(false);

  const [newJob, setNewJob] = useState({
    job_id: "",
    title: "",
    company: "",
    type: "",
    ctc: "",
    stipend: "",
    deadlineDate: "",
    deadlineTime: "",
    deadlineAmPm: "AM",
    eligibility: [] as string[],
    description: "",
    bond: "",
    rounds: "",
    location: "",
  });

  // Generate unique Job ID
  const generateJobId = () => {
    const company = newJob.company.replace(/\s+/g, "").toUpperCase().slice(0, 6);
    const year = new Date().getFullYear();
    return `${company || "JOB"}${year}`;
  };

  // Format deadline for display
  const formatDeadlineForSubmit = () => {
    if (!newJob.deadlineDate || !newJob.deadlineTime) return "";

    const [hours, minutes] = newJob.deadlineTime.split(":");
    let hour = parseInt(hours);

    if (newJob.deadlineAmPm === "PM" && hour !== 12) {
      hour += 12;
    } else if (newJob.deadlineAmPm === "AM" && hour === 12) {
      hour = 0;
    }

    const formattedHour = hour.toString().padStart(2, "0");
    return `${newJob.deadlineDate}T${formattedHour}:${minutes}:00`;
  };

  // Handle file upload from local computer
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: AttachedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Create a local URL for preview (in production, you'd upload to server)
      const url = URL.createObjectURL(file);
      newFiles.push({
        name: file.name,
        url: url,
        type: "local",
        size: file.size,
      });
    }
    setAttachedFiles([...attachedFiles, ...newFiles]);
    toast({
      title: "Files Added",
      description: `${newFiles.length} file(s) attached successfully.`,
    });
  };

  // Handle Google Drive link
  const handleAddDriveLink = () => {
    if (!driveLink.trim()) return;

    // Extract file name from Google Drive link or use default
    let fileName = "Google Drive File";
    if (driveLink.includes("/d/")) {
      fileName = "Drive Document";
    }

    setAttachedFiles([
      ...attachedFiles,
      {
        name: fileName,
        url: driveLink,
        type: "drive",
      },
    ]);
    setDriveLink("");
    setShowDriveLinkInput(false);
    toast({
      title: "Drive Link Added",
      description: "Google Drive link attached successfully.",
    });
  };

  // Remove attached file
  const removeFile = (index: number) => {
    const newFiles = [...attachedFiles];
    newFiles.splice(index, 1);
    setAttachedFiles(newFiles);
  };

  const handleAddJob = async () => {
    // Validate required fields
    if (!newJob.job_id || !newJob.title || !newJob.company || !newJob.type || !newJob.ctc) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields (Job ID, Title, Company, Type, CTC).",
        variant: "destructive",
      });
      return;
    }

    if (!newJob.deadlineDate || !newJob.deadlineTime) {
      toast({
        title: "Missing Deadline",
        description: "Please set the application deadline.",
        variant: "destructive",
      });
      return;
    }

    const deadline = formatDeadlineForSubmit();

    // Create job data object with only the fields the API expects
    const jobData = {
      job_id: newJob.job_id,
      title: newJob.title,
      company: newJob.company,
      type: newJob.type,
      ctc: newJob.ctc,
      stipend: newJob.stipend || "N/A",
      deadline,
      description: newJob.description,
      bond: newJob.bond,
      location: newJob.location,
      eligibility:
        newJob.eligibility.length > 0 ? newJob.eligibility : ["All Branches"],
      rounds: newJob.rounds
        ? newJob.rounds.split(",").map((r) => r.trim())
        : [],
      attachments: attachedFiles.map((f) => ({ filename: f.name, url: f.url })),
    };

    try {
      setIsSubmitting(true);
      console.log("Admin adding job to MongoDB:", jobData);
      await addJob(jobData);

      toast({
        title: "Success!",
        description: "Job posted successfully. Students can now see it.",
      });

      // Reset form
      setNewJob({
        job_id: "",
        title: "",
        company: "",
        type: "",
        ctc: "",
        stipend: "",
        deadlineDate: "",
        deadlineTime: "",
        deadlineAmPm: "AM",
        eligibility: [],
        description: "",
        bond: "",
        rounds: "",
        location: "",
      });
      setAttachedFiles([]);
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error("Error adding job:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to post job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteJob(jobId);
      toast({
        title: "Success",
        description: "Job deleted successfully.",
      });
    } catch (err: any) {
      console.error("Error deleting job:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete job.",
        variant: "destructive",
      });
    }
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
    <AdminLayout>
      <main className="p-6">
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={refreshJobs}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </Button>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4" />
                    Post New Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Post New Job Opportunity</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Job ID and Company */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="job_id" className="text-sm font-semibold">
                          Job ID <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="job_id"
                            value={newJob.job_id}
                            onChange={(e) =>
                              setNewJob({ ...newJob, job_id: e.target.value.toUpperCase() })
                            }
                            placeholder="e.g., GOOGLE2025"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNewJob({ ...newJob, job_id: generateJobId() })}
                          >
                            Auto
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Format: COMPANY+YEAR</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-sm font-semibold">
                          Company Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="company"
                          value={newJob.company}
                          onChange={(e) =>
                            setNewJob({ ...newJob, company: e.target.value })
                          }
                          placeholder="e.g., Google, Microsoft"
                        />
                      </div>
                    </div>

                    {/* Job Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-semibold">
                        Job Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={newJob.title}
                        onChange={(e) =>
                          setNewJob({ ...newJob, title: e.target.value })
                        }
                        placeholder="e.g., Software Engineer, Data Analyst"
                      />
                    </div>

                    {/* Job Type and CTC */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">
                          Job Type <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={newJob.type}
                          onValueChange={(value) =>
                            setNewJob({ ...newJob, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full Time">Full Time</SelectItem>
                            <SelectItem value="Internship">Internship</SelectItem>
                            <SelectItem value="Intern + Full Time">Intern + Full Time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ctc" className="text-sm font-semibold">
                          CTC / Package <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="ctc"
                          value={newJob.ctc}
                          onChange={(e) =>
                            setNewJob({ ...newJob, ctc: e.target.value })
                          }
                          placeholder="e.g., 12 LPA, 8-15 LPA"
                        />
                      </div>
                    </div>

                    {/* Stipend and Location */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stipend" className="text-sm font-semibold">Stipend (for internship)</Label>
                        <Input
                          id="stipend"
                          value={newJob.stipend}
                          onChange={(e) =>
                            setNewJob({ ...newJob, stipend: e.target.value })
                          }
                          placeholder="e.g., ₹50,000/month or N/A"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-semibold">Location</Label>
                        <Input
                          id="location"
                          value={newJob.location}
                          onChange={(e) =>
                            setNewJob({ ...newJob, location: e.target.value })
                          }
                          placeholder="e.g., Bangalore, Remote, Hybrid"
                        />
                      </div>
                    </div>

                    {/* Deadline Section */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Application Deadline <span className="text-destructive">*</span>
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Date (DD-MM-YYYY)</Label>
                          <Input
                            type="date"
                            value={newJob.deadlineDate}
                            onChange={(e) =>
                              setNewJob({ ...newJob, deadlineDate: e.target.value })
                            }
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Time (HH:MM)</Label>
                          <Input
                            type="time"
                            value={newJob.deadlineTime}
                            onChange={(e) =>
                              setNewJob({ ...newJob, deadlineTime: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">AM/PM</Label>
                          <Select
                            value={newJob.deadlineAmPm}
                            onValueChange={(value) =>
                              setNewJob({ ...newJob, deadlineAmPm: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AM">AM</SelectItem>
                              <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-semibold">Job Description</Label>
                      <Textarea
                        id="description"
                        value={newJob.description}
                        onChange={(e) =>
                          setNewJob({ ...newJob, description: e.target.value })
                        }
                        placeholder="Describe the role, responsibilities, requirements..."
                        rows={4}
                      />
                    </div>

                    {/* Eligibility */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Eligible Branches</Label>
                      <Select
                        value={newJob.eligibility.length > 0 ? newJob.eligibility[0] : ""}
                        onValueChange={(value) =>
                          setNewJob({
                            ...newJob,
                            eligibility: value === "All Branches" ? ["All Branches"] : [value],
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select eligible branches" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All Branches">All Branches</SelectItem>
                          <SelectItem value="CSE">Computer Science & Engineering</SelectItem>
                          <SelectItem value="IT">Information Technology</SelectItem>
                          <SelectItem value="ECE">Electronics & Communication</SelectItem>
                          <SelectItem value="EEE">Electrical & Electronics</SelectItem>
                          <SelectItem value="MECH">Mechanical Engineering</SelectItem>
                          <SelectItem value="CIVIL">Civil Engineering</SelectItem>
                          <SelectItem value="DS">Data Science</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Bond and Rounds */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bond" className="text-sm font-semibold">Bond Period</Label>
                        <Input
                          id="bond"
                          value={newJob.bond}
                          onChange={(e) =>
                            setNewJob({ ...newJob, bond: e.target.value })
                          }
                          placeholder="e.g., 2 years, No Bond"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rounds" className="text-sm font-semibold">Selection Rounds</Label>
                        <Input
                          id="rounds"
                          value={newJob.rounds}
                          onChange={(e) =>
                            setNewJob({ ...newJob, rounds: e.target.value })
                          }
                          placeholder="e.g., Aptitude, Technical, HR"
                        />
                        <p className="text-xs text-muted-foreground">Separate with commas</p>
                      </div>
                    </div>

                    {/* File Attachments Section */}
                    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Attachments (Job Description, Forms, etc.)
                      </Label>

                      {/* Attached Files List */}
                      {attachedFiles.length > 0 && (
                        <div className="space-y-2">
                          {attachedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-background rounded border"
                            >
                              <div className="flex items-center gap-2">
                                {file.type === "drive" ? (
                                  <Link className="w-4 h-4 text-blue-500" />
                                ) : (
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                {file.size && (
                                  <span className="text-xs text-muted-foreground">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                  </span>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          multiple
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload from Computer
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDriveLinkInput(!showDriveLinkInput)}
                        >
                          <Link className="w-4 h-4 mr-2" />
                          Add Google Drive Link
                        </Button>
                      </div>

                      {/* Google Drive Link Input */}
                      {showDriveLinkInput && (
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={driveLink}
                            onChange={(e) => setDriveLink(e.target.value)}
                            placeholder="Paste Google Drive link here..."
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddDriveLink}
                          >
                            Add
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowDriveLinkInput(false);
                              setDriveLink("");
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddModalOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddJob}
                        disabled={isSubmitting}
                        className="min-w-[120px]"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Post Job
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

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
                      {jobs.reduce((sum, job) => sum + (job.appliedCount || 0), 0)}
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
                      {jobs.reduce((sum, job) => sum + (job.selectedCount || 0), 0)}
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
              <CardTitle>Posted Job Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading jobs...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="py-12 text-center">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No jobs posted yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Click "Post New Job" to add your first job opportunity.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <Card key={job.job_id || job._id} className="p-4">
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
                              {job.appliedCount || 0} Applied
                            </span>
                            <span className="text-green-600">
                              {job.selectedCount || 0} Selected
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Eligibility
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {job.eligibility?.slice(0, 2).map((branch) => (
                              <Badge
                                key={branch}
                                variant="outline"
                                className="text-xs"
                              >
                                {branch}
                              </Badge>
                            ))}
                            {job.eligibility?.length > 2 && (
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
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AdminPlacement;
