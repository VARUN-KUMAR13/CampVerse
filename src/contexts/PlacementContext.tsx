import React, { createContext, useContext, useState, ReactNode } from "react";

export interface PlacementJob {
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
  postedDate: string;
  attachments: string[];
  description?: string;
  bond?: string;
  rounds?: string | string[];
  applied?: boolean;
  eligible?: boolean;
}

interface PlacementContextType {
  jobs: PlacementJob[];
  addJob: (
    job: Omit<
      PlacementJob,
      | "appliedCount"
      | "shortlistedCount"
      | "selectedCount"
      | "postedDate"
      | "attachments"
      | "status"
    >,
  ) => void;
  updateJob: (jobId: string, updates: Partial<PlacementJob>) => void;
  deleteJob: (jobId: string) => void;
  applyToJob: (jobId: string, studentId: string) => void;
}

const PlacementContext = createContext<PlacementContextType | undefined>(
  undefined,
);

const initialJobs: PlacementJob[] = [
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
    description: "Software development role with modern tech stack",
    bond: "2 years",
    rounds: ["Online Test", "Technical Interview", "HR Interview"],
    applied: false,
    eligible: true,
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
    description: "Entry-level position in system engineering",
    bond: "2 years",
    rounds: ["Online Test", "Technical Interview", "HR Round"],
    applied: true,
    eligible: true,
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
    description: "Software development and project management",
    bond: "18 months",
    rounds: ["Aptitude Test", "Technical Round", "HR Interview"],
    applied: false,
    eligible: false,
  },
];

export const PlacementProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [jobs, setJobs] = useState<PlacementJob[]>(initialJobs);

  const addJob = (
    newJobData: Omit<
      PlacementJob,
      | "appliedCount"
      | "shortlistedCount"
      | "selectedCount"
      | "postedDate"
      | "attachments"
      | "status"
      | "applied"
      | "eligible"
    >,
  ) => {
    const job: PlacementJob = {
      ...newJobData,
      status: "Open",
      appliedCount: 0,
      shortlistedCount: 0,
      selectedCount: 0,
      postedDate: new Date().toISOString(),
      attachments: [],
      applied: false,
      eligible: true, // All students can see all jobs by default
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
          ? [newJobData.rounds as any]
          : [],
    };
    console.log("Adding new job:", job); // Debug log
    setJobs((prevJobs) => {
      const updatedJobs = [job, ...prevJobs];
      console.log("Updated jobs list:", updatedJobs); // Debug log
      return updatedJobs;
    });
  };

  const updateJob = (jobId: string, updates: Partial<PlacementJob>) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.job_id === jobId ? { ...job, ...updates } : job,
      ),
    );
  };

  const deleteJob = (jobId: string) => {
    setJobs((prevJobs) => prevJobs.filter((job) => job.job_id !== jobId));
  };

  const applyToJob = (jobId: string, studentId: string) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.job_id === jobId
          ? { ...job, applied: true, appliedCount: job.appliedCount + 1 }
          : job,
      ),
    );
  };

  return (
    <PlacementContext.Provider
      value={{
        jobs,
        addJob,
        updateJob,
        deleteJob,
        applyToJob,
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
