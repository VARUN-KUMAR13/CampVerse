import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";

export interface PlacementJob {
  _id?: string;
  job_id: string;
  title: string;
  company: string;
  type: string;
  ctc: string;
  stipend: string;
  deadline: string;
  status: string;
  eligibility: string[];
  appliedCount: number;
  shortlistedCount: number;
  selectedCount: number;
  postedDate?: string;
  createdAt?: string;
  attachments: string[] | { filename: string; url: string }[];
  description?: string;
  bond?: string;
  rounds?: string | string[];
  applied?: boolean;
  eligible?: boolean;
  canApply?: boolean;
  applicationStatus?: string | null;
  location?: string;
  requirements?: string[];
  benefits?: string[];
}

interface PlacementContextType {
  jobs: PlacementJob[];
  loading: boolean;
  error: string | null;
  addJob: (
    job: Omit<
      PlacementJob,
      | "_id"
      | "appliedCount"
      | "shortlistedCount"
      | "selectedCount"
      | "postedDate"
      | "createdAt"
      | "status"
      | "applied"
      | "eligible"
      | "canApply"
      | "applicationStatus"
    >
  ) => Promise<void>;
  updateJob: (jobId: string, updates: Partial<PlacementJob>) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  applyToJob: (jobId: string, studentId: string) => Promise<void>;
  refreshJobs: () => Promise<void>;
}

const PlacementContext = createContext<PlacementContextType | undefined>(
  undefined
);

export const PlacementProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [jobs, setJobs] = useState<PlacementJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Fetch jobs from MongoDB API
  const fetchJobs = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Fetching jobs from MongoDB API...");

      const response = await api.get("/placements");
      console.log("API Response:", response);

      // Handle the response structure from the backend
      const jobsData = response.jobs || response;

      if (Array.isArray(jobsData)) {
        // Normalize job data for frontend compatibility
        const normalizedJobs = jobsData.map((job: any) => ({
          ...job,
          // Ensure consistent field names
          postedDate: job.postedDate || job.createdAt,
          attachments: job.attachments || [],
          // Set eligibility flags for students
          eligible: job.canApply !== undefined ? job.canApply : true,
          applied: job.applied || false,
        }));

        setJobs(normalizedJobs);
        console.log("Jobs loaded from MongoDB:", normalizedJobs.length);
      } else {
        console.warn("Unexpected response format:", response);
        setJobs([]);
      }
    } catch (err: any) {
      console.error("Error fetching jobs from API:", err);
      setError(err.message || "Failed to load jobs");
      // Don't clear jobs on error, keep the last known state
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Fetch jobs when user logs in
  useEffect(() => {
    if (currentUser) {
      fetchJobs();
    } else {
      setJobs([]);
      setLoading(false);
    }
  }, [currentUser, fetchJobs]);

  // Add a new job via API
  const addJob = async (
    newJobData: Omit<
      PlacementJob,
      | "_id"
      | "appliedCount"
      | "shortlistedCount"
      | "selectedCount"
      | "postedDate"
      | "createdAt"
      | "status"
      | "applied"
      | "eligible"
      | "canApply"
      | "applicationStatus"
    >
  ) => {
    try {
      setError(null);
      console.log("Adding new job to MongoDB:", newJobData);

      // Prepare job data for API
      const jobPayload = {
        ...newJobData,
        status: "Open",
        // Ensure eligibility is an array
        eligibility: Array.isArray(newJobData.eligibility)
          ? newJobData.eligibility
          : newJobData.eligibility
            ? [newJobData.eligibility as any]
            : ["All Branches"],
        // Ensure rounds is an array
        rounds: Array.isArray(newJobData.rounds)
          ? newJobData.rounds
          : newJobData.rounds
            ? (newJobData.rounds as string).split(",").map((r) => r.trim())
            : [],
      };

      const response = await api.post("/placements", jobPayload);
      console.log("Job created successfully:", response);

      // Refresh jobs list to get the new job from MongoDB
      await fetchJobs();
    } catch (err: any) {
      console.error("Error adding job:", err);
      setError(err.message || "Failed to add job");
      throw err;
    }
  };

  // Update a job via API
  const updateJob = async (jobId: string, updates: Partial<PlacementJob>) => {
    try {
      setError(null);
      console.log("Updating job:", jobId, updates);

      // Find the job's MongoDB _id
      const job = jobs.find((j) => j.job_id === jobId || j._id === jobId);
      if (!job?._id) {
        throw new Error("Job not found");
      }

      const response = await api.put(`/placements/${job._id}`, updates);
      console.log("Job updated successfully:", response);

      // Refresh jobs list
      await fetchJobs();
    } catch (err: any) {
      console.error("Error updating job:", err);
      setError(err.message || "Failed to update job");
      throw err;
    }
  };

  // Delete a job via API
  const deleteJob = async (jobId: string) => {
    try {
      setError(null);
      console.log("Deleting job:", jobId);

      // Find the job's MongoDB _id
      const job = jobs.find((j) => j.job_id === jobId || j._id === jobId);
      if (!job?._id) {
        throw new Error("Job not found");
      }

      await api.delete(`/placements/${job._id}`);
      console.log("Job deleted successfully");

      // Remove job from local state immediately for better UX
      setJobs((prevJobs) =>
        prevJobs.filter((j) => j.job_id !== jobId && j._id !== jobId)
      );
    } catch (err: any) {
      console.error("Error deleting job:", err);
      setError(err.message || "Failed to delete job");
      throw err;
    }
  };

  // Apply to a job via API
  const applyToJob = async (jobId: string, studentId: string) => {
    try {
      setError(null);
      console.log("Applying to job:", jobId);

      // Find the job's MongoDB _id
      const job = jobs.find((j) => j.job_id === jobId || j._id === jobId);
      if (!job?._id) {
        throw new Error("Job not found");
      }

      const response = await api.post(`/placements/${job._id}/apply`, {
        notes: `Applied by ${studentId}`,
      });
      console.log("Application submitted:", response);

      // Update local state to reflect the application
      setJobs((prevJobs) =>
        prevJobs.map((j) =>
          j.job_id === jobId || j._id === jobId
            ? { ...j, applied: true, appliedCount: j.appliedCount + 1 }
            : j
        )
      );
    } catch (err: any) {
      console.error("Error applying to job:", err);
      setError(err.message || "Failed to apply to job");
      throw err;
    }
  };

  // Manual refresh function
  const refreshJobs = async () => {
    await fetchJobs();
  };

  return (
    <PlacementContext.Provider
      value={{
        jobs,
        loading,
        error,
        addJob,
        updateJob,
        deleteJob,
        applyToJob,
        refreshJobs,
      }}
    >
      {children}
    </PlacementContext.Provider>
  );
};

export const usePlacement = () => {
  const context = useContext(PlacementContext);
  if (context === undefined) {
    throw new Error("usePlacement must be used within a PlacementProvider");
  }
  return context;
};
