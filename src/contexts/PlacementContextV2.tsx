import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { placementAPI, type PlacementJob as APIPlacementJob, type JobApplication } from "../services/api";
import { useAuth } from "./AuthContext";
import { toast } from "@/hooks/use-toast";

// Extended interface with frontend-specific fields
export interface PlacementJob extends Omit<APIPlacementJob, '_id' | 'postedBy' | 'createdAt' | 'updatedAt'> {
  _id?: string;
  applied?: boolean;
  applicationStatus?: string | null;
  canApply?: boolean;
  application?: JobApplication | null;
  postedBy?: {
    _id: string;
    name: string;
    collegeId: string;
    email?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface PlacementContextType {
  jobs: PlacementJob[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
  filters: {
    status?: string;
    company?: string;
    type?: string;
    eligibility?: string;
  };
  
  // Actions
  fetchJobs: (page?: number, filters?: any) => Promise<void>;
  addJob: (jobData: Partial<PlacementJob>) => Promise<PlacementJob | null>;
  updateJob: (jobId: string, updates: Partial<PlacementJob>) => Promise<PlacementJob | null>;
  deleteJob: (jobId: string) => Promise<boolean>;
  applyToJob: (jobId: string, applicationData?: any) => Promise<boolean>;
  getJobById: (jobId: string) => Promise<PlacementJob | null>;
  
  // Filters and pagination
  setFilters: (filters: any) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  
  // Real-time updates
  refreshJobs: () => Promise<void>;
  
  // Student specific
  getStudentApplications: () => Promise<JobApplication[]>;
  
  // Admin/Faculty specific
  getJobApplications: (jobId: string) => Promise<JobApplication[]>;
  updateApplicationStatus: (jobId: string, applicationId: string, status: string) => Promise<boolean>;
  getPlacementStats: () => Promise<any>;
}

const PlacementContext = createContext<PlacementContextType | undefined>(undefined);

export const PlacementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userData, currentUser } = useAuth();
  const [jobs, setJobs] = useState<PlacementJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const [filters, setFiltersState] = useState({});

  // Fetch jobs from API
  const fetchJobs = useCallback(async (page: number = 1, customFilters: any = {}) => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters,
        ...customFilters,
      });

      const response = await fetch(`/api/placements?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      
      setJobs(data.jobs || []);
      setPagination(data.pagination || { current: 1, pages: 1, total: 0 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch jobs';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, filters]);

  // Add new job
  const addJob = useCallback(async (jobData: Partial<PlacementJob>): Promise<PlacementJob | null> => {
    if (!currentUser || !['admin', 'faculty'].includes(userData?.role || '')) {
      toast({
        title: "Error", 
        description: "You don't have permission to add jobs",
        variant: "destructive",
      });
      return null;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/placements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create job');
      }

      const data = await response.json();
      const newJob = data.job;
      
      // Add to local state
      setJobs(prev => [newJob, ...prev]);
      
      toast({
        title: "Success",
        description: "Job posted successfully",
      });
      
      return newJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add job';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser, userData]);

  // Update job
  const updateJob = useCallback(async (jobId: string, updates: Partial<PlacementJob>): Promise<PlacementJob | null> => {
    if (!currentUser || !['admin', 'faculty'].includes(userData?.role || '')) {
      toast({
        title: "Error",
        description: "You don't have permission to update jobs",
        variant: "destructive",
      });
      return null;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/placements/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update job');
      }

      const data = await response.json();
      const updatedJob = data.job;
      
      // Update local state
      setJobs(prev => prev.map(job => 
        job._id === jobId ? { ...job, ...updatedJob } : job
      ));
      
      toast({
        title: "Success",
        description: "Job updated successfully",
      });
      
      return updatedJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update job';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser, userData]);

  // Delete job
  const deleteJob = useCallback(async (jobId: string): Promise<boolean> => {
    if (!currentUser || userData?.role !== 'admin') {
      toast({
        title: "Error",
        description: "Only administrators can delete jobs",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/placements/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete job');
      }
      
      // Remove from local state
      setJobs(prev => prev.filter(job => job._id !== jobId));
      
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete job';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, userData]);

  // Apply to job
  const applyToJob = useCallback(async (jobId: string, applicationData: any = {}): Promise<boolean> => {
    if (!currentUser || userData?.role !== 'student') {
      toast({
        title: "Error",
        description: "Only students can apply to jobs",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/placements/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply to job');
      }
      
      // Update local state
      setJobs(prev => prev.map(job => 
        job._id === jobId ? { 
          ...job, 
          applied: true, 
          appliedCount: (job.appliedCount || 0) + 1,
          applicationStatus: 'Applied'
        } : job
      ));
      
      toast({
        title: "Success",
        description: "Application submitted successfully",
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply to job';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, userData]);

  // Get job by ID
  const getJobById = useCallback(async (jobId: string): Promise<PlacementJob | null> => {
    if (!currentUser) return null;

    try {
      const response = await fetch(`/api/placements/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Job not found');
      }

      const job = await response.json();
      return job;
    } catch (err) {
      console.error('Error fetching job:', err);
      return null;
    }
  }, [currentUser]);

  // Student applications
  const getStudentApplications = useCallback(async (): Promise<JobApplication[]> => {
    if (!currentUser || userData?.role !== 'student') return [];

    try {
      const response = await fetch('/api/placements/student/applications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch applications');

      const data = await response.json();
      return data.applications || [];
    } catch (err) {
      console.error('Error fetching applications:', err);
      return [];
    }
  }, [currentUser, userData]);

  // Get applications for a job (admin/faculty)
  const getJobApplications = useCallback(async (jobId: string): Promise<JobApplication[]> => {
    if (!currentUser || !['admin', 'faculty'].includes(userData?.role || '')) return [];

    try {
      const response = await fetch(`/api/placements/${jobId}/applications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch job applications');

      const data = await response.json();
      return data.applications || [];
    } catch (err) {
      console.error('Error fetching job applications:', err);
      return [];
    }
  }, [currentUser, userData]);

  // Update application status
  const updateApplicationStatus = useCallback(async (
    jobId: string, 
    applicationId: string, 
    status: string
  ): Promise<boolean> => {
    if (!currentUser || !['admin', 'faculty'].includes(userData?.role || '')) return false;

    try {
      const response = await fetch(`/api/placements/${jobId}/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update application status');

      toast({
        title: "Success",
        description: "Application status updated successfully",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update application status';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [currentUser, userData]);

  // Get placement statistics
  const getPlacementStats = useCallback(async () => {
    if (!currentUser || !['admin', 'faculty'].includes(userData?.role || '')) return null;

    try {
      const response = await fetch('/api/placements/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      return await response.json();
    } catch (err) {
      console.error('Error fetching placement stats:', err);
      return null;
    }
  }, [currentUser, userData]);

  // Filter and pagination functions
  const setFilters = useCallback((newFilters: any) => {
    setFiltersState(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
  }, []);

  const refreshJobs = useCallback(() => {
    return fetchJobs(pagination.current, filters);
  }, [fetchJobs, pagination.current, filters]);

  // Load jobs when context mounts or auth changes
  useEffect(() => {
    if (currentUser && userData) {
      fetchJobs(1);
    }
  }, [currentUser, userData, fetchJobs]);

  // Auto-refresh jobs every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser && userData) {
        refreshJobs();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [currentUser, userData, refreshJobs]);

  const value: PlacementContextType = {
    jobs,
    loading,
    error,
    pagination,
    filters,
    
    fetchJobs,
    addJob,
    updateJob,
    deleteJob,
    applyToJob,
    getJobById,
    
    setFilters,
    clearFilters,
    setPage,
    
    refreshJobs,
    
    getStudentApplications,
    getJobApplications,
    updateApplicationStatus,
    getPlacementStats,
  };

  return (
    <PlacementContext.Provider value={value}>
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
