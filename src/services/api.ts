/**
 * Comprehensive API Service Layer for CampVerse
 * Handles all backend communications with proper error handling and type safety
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function for making API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add authorization token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: 'Unknown error occurred' 
      }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response.text() as unknown as T;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Type definitions
export interface User {
  _id: string;
  uid: string;
  name: string;
  collegeId: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  year?: string;
  section?: string;
  branch?: string;
  rollNumber?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlacementJob {
  _id: string;
  job_id: string;
  title: string;
  company: string;
  type: string;
  ctc: string;
  stipend?: string;
  deadline: string;
  status: 'Open' | 'Closed' | 'Draft';
  eligibility: string[];
  description?: string;
  bond?: string;
  rounds?: string[];
  attachments?: string[];
  appliedCount: number;
  shortlistedCount: number;
  selectedCount: number;
  postedDate: string;
  postedBy: string; // User ID who posted
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplication {
  _id: string;
  jobId: string;
  studentId: string;
  status: 'Applied' | 'Shortlisted' | 'Selected' | 'Rejected';
  appliedDate: Date;
  documents: string[];
  notes?: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: 'General' | 'Academic' | 'Event' | 'Emergency';
  targetAudience: string[]; // roles or specific groups
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  expiryDate?: Date;
  attachments?: string[];
  postedBy: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  eventDate: Date;
  location: string;
  organizer: string;
  category: 'Academic' | 'Cultural' | 'Sports' | 'Technical' | 'Other';
  registrationRequired: boolean;
  maxParticipants?: number;
  registeredCount: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  attachments?: string[];
  postedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: Date;
  totalMarks: number;
  attachments?: string[];
  targetGroups: string[]; // year, section, branch combinations
  submissions: AssignmentSubmission[];
  postedBy: string; // Faculty ID
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentSubmission {
  _id: string;
  assignmentId: string;
  studentId: string;
  submittedFiles: string[];
  submissionText?: string;
  submittedDate: Date;
  grade?: number;
  feedback?: string;
  status: 'Submitted' | 'Graded' | 'Late' | 'Missing';
}

// User Management API
export const userAPI = {
  // Get all users (admin only)
  getAll: (): Promise<User[]> => 
    apiRequest<User[]>('/users'),

  // Get user by ID
  getById: (id: string): Promise<User> => 
    apiRequest<User>(`/users/${id}`),

  // Create new user
  create: (userData: Partial<User>): Promise<User> => 
    apiRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Update user
  update: (id: string, updates: Partial<User>): Promise<User> => 
    apiRequest<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Delete user (admin only)
  delete: (id: string): Promise<{ message: string }> => 
    apiRequest<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    }),

  // Get users by role
  getByRole: (role: string): Promise<User[]> => 
    apiRequest<User[]>(`/users/role/${role}`),

  // Search users
  search: (query: string): Promise<User[]> => 
    apiRequest<User[]>(`/users/search?q=${encodeURIComponent(query)}`),
};

// Placement Job Management API
export const placementAPI = {
  // Get all jobs
  getAll: (): Promise<PlacementJob[]> => 
    apiRequest<PlacementJob[]>('/placements'),

  // Get job by ID
  getById: (id: string): Promise<PlacementJob> => 
    apiRequest<PlacementJob>(`/placements/${id}`),

  // Create new job (admin/faculty only)
  create: (jobData: Partial<PlacementJob>): Promise<PlacementJob> => 
    apiRequest<PlacementJob>('/placements', {
      method: 'POST',
      body: JSON.stringify(jobData),
    }),

  // Update job
  update: (id: string, updates: Partial<PlacementJob>): Promise<PlacementJob> => 
    apiRequest<PlacementJob>(`/placements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Delete job
  delete: (id: string): Promise<{ message: string }> => 
    apiRequest<{ message: string }>(`/placements/${id}`, {
      method: 'DELETE',
    }),

  // Apply to job
  apply: (jobId: string, applicationData: Partial<JobApplication>): Promise<JobApplication> => 
    apiRequest<JobApplication>(`/placements/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    }),

  // Get applications for a job (admin/faculty only)
  getApplications: (jobId: string): Promise<JobApplication[]> => 
    apiRequest<JobApplication[]>(`/placements/${jobId}/applications`),

  // Update application status
  updateApplicationStatus: (
    jobId: string, 
    applicationId: string, 
    status: JobApplication['status']
  ): Promise<JobApplication> => 
    apiRequest<JobApplication>(`/placements/${jobId}/applications/${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// Announcements API
export const announcementAPI = {
  // Get all announcements
  getAll: (): Promise<Announcement[]> => 
    apiRequest<Announcement[]>('/announcements'),

  // Get announcement by ID
  getById: (id: string): Promise<Announcement> => 
    apiRequest<Announcement>(`/announcements/${id}`),

  // Create announcement (admin/faculty only)
  create: (data: Partial<Announcement>): Promise<Announcement> => 
    apiRequest<Announcement>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update announcement
  update: (id: string, updates: Partial<Announcement>): Promise<Announcement> => 
    apiRequest<Announcement>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Delete announcement
  delete: (id: string): Promise<{ message: string }> => 
    apiRequest<{ message: string }>(`/announcements/${id}`, {
      method: 'DELETE',
    }),

  // Get announcements by target audience
  getByAudience: (audience: string): Promise<Announcement[]> => 
    apiRequest<Announcement[]>(`/announcements/audience/${audience}`),
};

// Events API
export const eventAPI = {
  // Get all events
  getAll: (): Promise<Event[]> => 
    apiRequest<Event[]>('/events'),

  // Get event by ID
  getById: (id: string): Promise<Event> => 
    apiRequest<Event>(`/events/${id}`),

  // Create event
  create: (data: Partial<Event>): Promise<Event> => 
    apiRequest<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update event
  update: (id: string, updates: Partial<Event>): Promise<Event> => 
    apiRequest<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Delete event
  delete: (id: string): Promise<{ message: string }> => 
    apiRequest<{ message: string }>(`/events/${id}`, {
      method: 'DELETE',
    }),

  // Register for event
  register: (eventId: string): Promise<{ message: string }> => 
    apiRequest<{ message: string }>(`/events/${eventId}/register`, {
      method: 'POST',
    }),

  // Get registered events for user
  getRegistered: (): Promise<Event[]> => 
    apiRequest<Event[]>('/events/registered'),
};

// Assignments API
export const assignmentAPI = {
  // Get all assignments
  getAll: (): Promise<Assignment[]> => 
    apiRequest<Assignment[]>('/assignments'),

  // Get assignment by ID
  getById: (id: string): Promise<Assignment> => 
    apiRequest<Assignment>(`/assignments/${id}`),

  // Create assignment (faculty only)
  create: (data: Partial<Assignment>): Promise<Assignment> => 
    apiRequest<Assignment>('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update assignment
  update: (id: string, updates: Partial<Assignment>): Promise<Assignment> => 
    apiRequest<Assignment>(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Delete assignment
  delete: (id: string): Promise<{ message: string }> => 
    apiRequest<{ message: string }>(`/assignments/${id}`, {
      method: 'DELETE',
    }),

  // Submit assignment
  submit: (assignmentId: string, submissionData: Partial<AssignmentSubmission>): Promise<AssignmentSubmission> => 
    apiRequest<AssignmentSubmission>(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(submissionData),
    }),

  // Get submissions for assignment (faculty only)
  getSubmissions: (assignmentId: string): Promise<AssignmentSubmission[]> => 
    apiRequest<AssignmentSubmission[]>(`/assignments/${assignmentId}/submissions`),

  // Grade submission (faculty only)
  gradeSubmission: (
    assignmentId: string, 
    submissionId: string, 
    grade: number, 
    feedback?: string
  ): Promise<AssignmentSubmission> => 
    apiRequest<AssignmentSubmission>(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
      method: 'PUT',
      body: JSON.stringify({ grade, feedback }),
    }),
};

// Authentication API
export const authAPI = {
  // Login
  login: (collegeId: string, password: string): Promise<{ user: User; token: string }> => 
    apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ collegeId, password }),
    }),

  // Refresh token
  refresh: (): Promise<{ token: string }> => 
    apiRequest<{ token: string }>('/auth/refresh', {
      method: 'POST',
    }),

  // Logout
  logout: (): Promise<{ message: string }> => 
    apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),

  // Reset password
  resetPassword: (collegeId: string): Promise<{ message: string }> => 
    apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ collegeId }),
    }),

  // Change password
  changePassword: (currentPassword: string, newPassword: string): Promise<{ message: string }> => 
    apiRequest<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Health check
export const healthAPI = {
  check: (): Promise<{ status: string; message: string }> => 
    apiRequest<{ status: string; message: string }>('/health'),
};

// File upload utility
export const uploadFile = async (file: File, folder: string = 'uploads'): Promise<{ url: string; filename: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('File upload failed');
  }

  return await response.json();
};

// Real-time connection utility (WebSocket)
export class RealTimeConnection {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect() {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      // Send authentication token
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.send('auth', { token });
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data.payload);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(type: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
}

// Export singleton instance
export const realTimeConnection = new RealTimeConnection();

// Default export with all APIs
export default {
  user: userAPI,
  placement: placementAPI,
  announcement: announcementAPI,
  event: eventAPI,
  assignment: assignmentAPI,
  auth: authAPI,
  health: healthAPI,
  uploadFile,
  realTimeConnection,
};
