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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { api } from "@/lib/api";
import {
  Plus,
  Building2,
  Calendar,
  Users,
  Edit,
  Trash2,
  FileText,
  Upload,
  Eye,
  Loader2,
  X,
  Link,
  Clock,
  AlertTriangle,
  UserCheck,
  Mail,
  GraduationCap,
  ExternalLink,
} from "lucide-react";

interface AttachedFile {
  name: string;
  url: string;
  type: "local" | "drive";
  size?: number;
  file?: File; // actual File object for local uploads
}

interface Applicant {
  _id: string;
  status: string;
  appliedDate: string;
  studentId: {
    _id: string;
    name: string;
    collegeId: string;
    email: string;
    year?: string;
    section?: string;
    branch?: string;
  };
}

const AdminPlacement = () => {
  const { userData } = useAuth();
  const { jobs, loading, error, addJob, updateJob, deleteJob, refreshJobs } = usePlacement();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [driveLink, setDriveLink] = useState("");
  const [showDriveLinkInput, setShowDriveLinkInput] = useState(false);

  // View modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewJob, setViewJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editJob, setEditJob] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editAttachedFiles, setEditAttachedFiles] = useState<AttachedFile[]>([]);
  const [editDriveLink, setEditDriveLink] = useState("");
  const [showEditDriveLinkInput, setShowEditDriveLinkInput] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    return `${newJob.deadlineDate}T${newJob.deadlineTime}:00`;
  };

  // Handle file upload from local computer (max 5MB per file)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const newFiles: AttachedFile[] = [];
    const skippedFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) {
        skippedFiles.push(file.name);
        continue;
      }
      newFiles.push({
        name: file.name,
        url: "", // URL will be set after uploading to server
        type: "local",
        size: file.size,
        file: file, // keep the File object for upload
      });
    }

    if (skippedFiles.length > 0) {
      toast({
        title: "File Too Large",
        description: `${skippedFiles.join(", ")} exceeded the 5MB limit and was not added.`,
        variant: "destructive",
      });
    }

    if (newFiles.length > 0) {
      setAttachedFiles([...attachedFiles, ...newFiles]);
      toast({
        title: "Files Added",
        description: `${newFiles.length} file(s) attached successfully.`,
      });
    }
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

    try {
      setIsSubmitting(true);
      console.log("Admin adding job to MongoDB...");

      // Upload local files to server first
      const localFiles = attachedFiles.filter((f) => f.type === "local" && f.file);
      let uploadedAttachments: { filename: string; url: string }[] = [];

      if (localFiles.length > 0) {
        const formData = new FormData();
        localFiles.forEach((f) => {
          if (f.file) formData.append("files", f.file);
        });

        // Use fetch directly for multipart uploads (api.post always JSON-stringifies)
        const token = localStorage.getItem("campverse_auth_token");
        const uploadResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/placements/upload`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );
        if (!uploadResponse.ok) throw new Error("File upload failed");
        const uploadData = await uploadResponse.json();
        uploadedAttachments = uploadData.files || [];
      }

      // Add drive links as-is
      const driveAttachments = attachedFiles
        .filter((f) => f.type === "drive")
        .map((f) => ({ filename: f.name, url: f.url }));

      const allAttachments = [...uploadedAttachments, ...driveAttachments];

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
        attachments: allAttachments,
      };

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

  // ── View modal handler ──
  const handleViewJob = async (job: any) => {
    setViewJob(job);
    setIsViewModalOpen(true);
    setLoadingApplicants(true);
    try {
      const res = await api.get(`/placements/${job._id}/applications?limit=100`);
      setApplicants(res.applications || []);
    } catch (err) {
      console.error("Error fetching applicants:", err);
      setApplicants([]);
    } finally {
      setLoadingApplicants(false);
    }
  };

  // ── Edit modal handler ──
  const handleOpenEdit = (job: any) => {
    setEditJob({
      ...job,
      deadlineDate: job.deadline ? job.deadline.split("T")[0] : "",
      deadlineTime: job.deadline ? job.deadline.split("T")[1]?.slice(0, 5) || "" : "",
      rounds: Array.isArray(job.rounds) ? job.rounds.join(", ") : (job.rounds || ""),
      eligibility: job.eligibility || [],
    });
    // Load existing attachments into edit state
    const existingAttachments: AttachedFile[] = (job.attachments || []).map((a: any) => ({
      name: a.filename || a.name || "Attachment",
      url: a.url || "",
      type: (a.url && (a.url.startsWith("http") || a.url.startsWith("https"))) ? "drive" as const : "local" as const,
    }));
    setEditAttachedFiles(existingAttachments);
    setEditDriveLink("");
    setShowEditDriveLinkInput(false);
    setIsEditModalOpen(true);
  };

  // Handle file upload for edit modal
  const handleEditFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const newFiles: AttachedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) continue;
      newFiles.push({ name: file.name, url: "", type: "local", size: file.size, file });
    }
    if (newFiles.length > 0) {
      setEditAttachedFiles([...editAttachedFiles, ...newFiles]);
      toast({ title: "Files Added", description: `${newFiles.length} file(s) attached.` });
    }
  };

  const handleAddEditDriveLink = () => {
    if (!editDriveLink.trim()) return;
    setEditAttachedFiles([
      ...editAttachedFiles,
      { name: "Google Drive File", url: editDriveLink, type: "drive" },
    ]);
    setEditDriveLink("");
    setShowEditDriveLinkInput(false);
  };

  const removeEditFile = (index: number) => {
    const updated = [...editAttachedFiles];
    updated.splice(index, 1);
    setEditAttachedFiles(updated);
  };

  const handleSaveEdit = async () => {
    if (!editJob) return;
    setIsEditing(true);
    try {
      const deadline = editJob.deadlineDate && editJob.deadlineTime
        ? `${editJob.deadlineDate}T${editJob.deadlineTime}:00`
        : editJob.deadline;

      // Upload new local files to server
      const newLocalFiles = editAttachedFiles.filter((f) => f.type === "local" && f.file);
      let uploadedAttachments: { filename: string; url: string }[] = [];

      if (newLocalFiles.length > 0) {
        const formData = new FormData();
        newLocalFiles.forEach((f) => {
          if (f.file) formData.append("files", f.file);
        });
        const token = localStorage.getItem("campverse_auth_token");
        const uploadResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/placements/upload`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );
        if (!uploadResponse.ok) throw new Error("File upload failed");
        const uploadData = await uploadResponse.json();
        uploadedAttachments = uploadData.files || [];
      }

      // Keep existing files (already on server) + drive links
      const existingAttachments = editAttachedFiles
        .filter((f) => !f.file) // not a new upload
        .map((f) => ({ filename: f.name, url: f.url }));

      const allAttachments = [...existingAttachments, ...uploadedAttachments];

      await updateJob(editJob.job_id, {
        title: editJob.title,
        company: editJob.company,
        type: editJob.type,
        ctc: editJob.ctc,
        stipend: editJob.stipend,
        deadline,
        description: editJob.description,
        bond: editJob.bond,
        location: editJob.location,
        eligibility: editJob.eligibility,
        rounds: editJob.rounds ? editJob.rounds.split(",").map((r: string) => r.trim()) : [],
        attachments: allAttachments,
      });
      toast({ title: "Success", description: "Job updated successfully." });
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update job.", variant: "destructive" });
    } finally {
      setIsEditing(false);
    }
  };

  // ── Delete handler ──
  const handleDeleteClick = (job: any) => {
    setDeleteTarget(job);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteJob(deleteTarget.job_id);
      toast({ title: "Deleted", description: `"${deleteTarget.title}" and all its applications have been deleted.` });
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete job.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
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

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case "Applied": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Shortlisted": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Selected": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  // If deadline has passed, treat the job as "Closed" regardless of stored status
  const getEffectiveStatus = (job: any) => {
    if (job.deadline && new Date(job.deadline) < new Date()) {
      return "Closed";
    }
    return job.status;
  };

  // Map full branch names to short codes
  const branchShortName = (branch: string | undefined): string => {
    if (!branch) return "—";
    const map: Record<string, string> = {
      "Computer Science and Engineering": "CSE",
      "Computer Science": "CSE",
      "Information Technology": "IT",
      "Electronics and Communication Engineering": "ECE",
      "Electronics & Communication Engineering": "ECE",
      "Electrical and Electronics Engineering": "EEE",
      "Electrical & Electronics Engineering": "EEE",
      "Mechanical Engineering": "MECH",
      "Civil Engineering": "CIVIL",
      "Chemical Engineering": "CHEM",
      "Aerospace Engineering": "AERO",
      "Biotechnology": "BIOTECH",
      "Data Science": "DS",
    };
    return map[branch] || branch;
  };

  return (
    <AdminLayout>
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
                    <div className="grid grid-cols-2 gap-3">
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
        <div className="grid md:grid-cols-3 gap-6">
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
                          {getStatusBadge(getEffectiveStatus(job))}
                          <Badge variant="secondary">ID: {job.job_id}</Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewJob(job)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenEdit(job)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(job)}
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

      {/* ═══ VIEW MODAL ═══ */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {viewJob?.title}
            </DialogTitle>
            <DialogDescription className="text-primary font-medium">
              {viewJob?.company} · {viewJob?.type}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Job summary row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">CTC</p>
                <p className="font-semibold text-sm">{viewJob?.ctc}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className="font-semibold text-sm">{viewJob?.deadline ? formatDate(viewJob.deadline) : "—"}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-semibold text-sm">{viewJob ? getEffectiveStatus(viewJob) : ""}</p>
              </div>
            </div>

            {/* Registered Students */}
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary" />
                Registered Students ({applicants.length})
              </h3>

              {loadingApplicants ? (
                <div className="py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Loading applicants...</p>
                </div>
              ) : applicants.length === 0 ? (
                <div className="py-8 text-center border rounded-lg bg-muted/20">
                  <Users className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No students have registered yet</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">#</th>
                        <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Student</th>
                        <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Roll No</th>
                        <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Branch</th>
                        <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Applied</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.map((app, idx) => (
                        <tr key={app._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 px-3 text-muted-foreground">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                {app.studentId?.name?.charAt(0) || "?"}
                              </div>
                              <span className="font-medium">{app.studentId?.name || "Unknown"}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-xs">{app.studentId?.collegeId || "—"}</td>
                          <td className="py-2.5 px-3">{branchShortName(app.studentId?.branch)}</td>
                          <td className="py-2.5 px-3">
                            <Badge variant="outline" className={`text-xs ${getApplicationStatusColor(app.status)}`}>
                              {app.status}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground text-xs">
                            {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) + ", " + new Date(app.appliedDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ EDIT MODAL ═══ */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Job Opportunity</DialogTitle>
            <DialogDescription>Update the details for this job posting.</DialogDescription>
          </DialogHeader>

          {editJob && (
            <div className="space-y-5 py-2">
              {/* Title & Company */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Job Title</Label>
                  <Input
                    value={editJob.title}
                    onChange={(e) => setEditJob({ ...editJob, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Company Name</Label>
                  <Input
                    value={editJob.company}
                    onChange={(e) => setEditJob({ ...editJob, company: e.target.value })}
                  />
                </div>
              </div>

              {/* Type & CTC */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Job Type</Label>
                  <Select value={editJob.type} onValueChange={(v) => setEditJob({ ...editJob, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label className="text-sm font-semibold">CTC / Package</Label>
                  <Input
                    value={editJob.ctc}
                    onChange={(e) => setEditJob({ ...editJob, ctc: e.target.value })}
                  />
                </div>
              </div>

              {/* Stipend & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Stipend</Label>
                  <Input
                    value={editJob.stipend || ""}
                    onChange={(e) => setEditJob({ ...editJob, stipend: e.target.value })}
                    placeholder="N/A"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Location</Label>
                  <Input
                    value={editJob.location || ""}
                    onChange={(e) => setEditJob({ ...editJob, location: e.target.value })}
                  />
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Deadline
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="date"
                    value={editJob.deadlineDate}
                    onChange={(e) => setEditJob({ ...editJob, deadlineDate: e.target.value })}
                  />
                  <Input
                    type="time"
                    value={editJob.deadlineTime}
                    onChange={(e) => setEditJob({ ...editJob, deadlineTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Description</Label>
                <Textarea
                  value={editJob.description || ""}
                  onChange={(e) => setEditJob({ ...editJob, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Bond & Rounds */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Bond Period</Label>
                  <Input
                    value={editJob.bond || ""}
                    onChange={(e) => setEditJob({ ...editJob, bond: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Selection Rounds</Label>
                  <Input
                    value={editJob.rounds || ""}
                    onChange={(e) => setEditJob({ ...editJob, rounds: e.target.value })}
                    placeholder="e.g., Aptitude, Technical, HR"
                  />
                </div>
              </div>

              {/* Eligibility */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Eligible Branches</Label>
                <Select
                  value={editJob.eligibility?.[0] || ""}
                  onValueChange={(v) => setEditJob({ ...editJob, eligibility: v === "All Branches" ? ["All Branches"] : [v] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Branches">All Branches</SelectItem>
                    <SelectItem value="CSE">CSE</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="ECE">ECE</SelectItem>
                    <SelectItem value="EEE">EEE</SelectItem>
                    <SelectItem value="MECH">MECH</SelectItem>
                    <SelectItem value="CIVIL">CIVIL</SelectItem>
                    <SelectItem value="DS">DS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* File Attachments */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Attachments
                </Label>

                {/* Existing files */}
                {editAttachedFiles.length > 0 && (
                  <div className="space-y-2">
                    {editAttachedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted/30 rounded-md px-3 py-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[250px]">{file.name}</span>
                          {file.size && (
                            <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeEditFile(index)} className="h-6 w-6 p-0">
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload buttons */}
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={editFileInputRef}
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleEditFileUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => editFileInputRef.current?.click()}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditDriveLinkInput(!showEditDriveLinkInput)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Drive Link
                  </Button>
                </div>

                {/* Drive link input */}
                {showEditDriveLinkInput && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste Google Drive link..."
                      value={editDriveLink}
                      onChange={(e) => setEditDriveLink(e.target.value)}
                    />
                    <Button size="sm" onClick={handleAddEditDriveLink}>Add</Button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isEditing}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={isEditing} className="min-w-[100px]">
                  {isEditing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE CONFIRMATION ═══ */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Job Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to delete <strong>"{deleteTarget?.title}"</strong> at <strong>{deleteTarget?.company}</strong>.
              </p>
              {(deleteTarget?.appliedCount || 0) > 0 && (
                <p className="text-red-500 font-medium">
                  ⚠️ {deleteTarget.appliedCount} student(s) have applied to this job. Their applications will also be deleted.
                </p>
              )}
              <p>This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</> : "Delete Job"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminPlacement;
