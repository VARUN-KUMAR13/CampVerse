import { useState, useEffect, useCallback } from 'react';
import { 
  StudentService, 
  CourseService, 
  AssignmentService,
  type StudentProfile, 
  type Course, 
  type Assignment 
} from '@/services/firestoreService';
import { useAuth } from '@/contexts/AuthContext';

// Generic Firestore hook
export const useFirestoreDocument = <T>(
  collection: string,
  docId: string | null
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Import firestoreService dynamically to avoid circular dependencies
    import('@/services/firestoreService').then(({ firestoreService }) => {
      firestoreService
        .getDocument(collection, docId)
        .then((document) => {
          setData(document);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    });
  }, [collection, docId]);

  return { data, loading, error };
};

// Student Profile Hook
export const useStudentProfile = (studentId?: string) => {
  const { currentUser, userData } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetStudentId = studentId || currentUser?.uid;

  const loadProfile = useCallback(async () => {
    if (!targetStudentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const profileData = await StudentService.getStudentProfile(targetStudentId);
      setProfile(profileData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [targetStudentId]);

  const updateProfile = useCallback(async (updates: Partial<StudentProfile>) => {
    if (!targetStudentId) return false;

    try {
      await StudentService.updateStudentProfile(targetStudentId, updates);
      await loadProfile(); // Reload profile after update
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [targetStudentId, loadProfile]);

  const saveProfile = useCallback(async (profileData: StudentProfile) => {
    try {
      await StudentService.saveStudentProfile(profileData);
      await loadProfile(); // Reload profile after save
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [loadProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile: profile || userData,
    loading,
    error,
    updateProfile,
    saveProfile,
    reloadProfile: loadProfile
  };
};

// Students List Hook
export const useStudentsList = (branch?: string, year?: string) => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let studentsData: StudentProfile[];
      if (branch && year) {
        studentsData = await StudentService.getStudentsByBranch(branch, year);
      } else {
        studentsData = await StudentService.getAllStudents();
      }
      
      setStudents(studentsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branch, year]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  return {
    students,
    loading,
    error,
    reloadStudents: loadStudents
  };
};

// Courses Hook
export const useCourses = (branch?: string, semester?: number) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (branch && semester) {
        const coursesData = await CourseService.getCoursesByBranch(branch, semester);
        setCourses(coursesData);
      } else {
        setCourses([]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branch, semester]);

  const createCourse = useCallback(async (courseData: Course) => {
    try {
      const courseId = await CourseService.createCourse(courseData);
      await loadCourses(); // Reload courses
      return courseId;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [loadCourses]);

  const enrollStudent = useCallback(async (courseId: string, studentId: string) => {
    try {
      await CourseService.enrollStudent(courseId, studentId);
      await loadCourses(); // Reload courses
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [loadCourses]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  return {
    courses,
    loading,
    error,
    createCourse,
    enrollStudent,
    reloadCourses: loadCourses
  };
};

// Assignments Hook
export const useAssignments = (courseId?: string) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssignments = useCallback(async () => {
    if (!courseId) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const assignmentsData = await AssignmentService.getAssignmentsByCourse(courseId);
      setAssignments(assignmentsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const createAssignment = useCallback(async (assignmentData: Assignment) => {
    try {
      const assignmentId = await AssignmentService.createAssignment(assignmentData);
      await loadAssignments(); // Reload assignments
      return assignmentId;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [loadAssignments]);

  const submitAssignment = useCallback(async (assignmentId: string, submission: any) => {
    try {
      await AssignmentService.submitAssignment(assignmentId, submission);
      await loadAssignments(); // Reload assignments
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [loadAssignments]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  return {
    assignments,
    loading,
    error,
    createAssignment,
    submitAssignment,
    reloadAssignments: loadAssignments
  };
};

// Student Dashboard Data Hook
export const useStudentDashboard = () => {
  const { userData } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useStudentProfile();
  const { courses, loading: coursesLoading } = useCourses(
    userData?.branch,
    userData?.role === 'student' ? parseInt(userData.year) + 1 : undefined
  );

  const [dashboardStats, setDashboardStats] = useState({
    totalCourses: 0,
    completedAssignments: 0,
    upcomingAssignments: 0,
    currentCGPA: 0
  });

  useEffect(() => {
    // Calculate dashboard statistics
    if (courses.length > 0) {
      setDashboardStats(prev => ({
        ...prev,
        totalCourses: courses.length,
        currentCGPA: profile?.profile?.academic?.cgpa || 0
      }));
    }
  }, [courses, profile]);

  return {
    userData,
    profile,
    courses,
    dashboardStats,
    loading: profileLoading || coursesLoading,
    updateProfile
  };
};

// Dataset Import Hook
export const useDatasetImport = () => {
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const importStudentDataset = useCallback(async (students: StudentProfile[]) => {
    try {
      setImporting(true);
      setImportError(null);
      setImportSuccess(false);

      await StudentService.importStudentsFromDataset(students);
      
      setImportSuccess(true);
      return true;
    } catch (err: any) {
      setImportError(err.message);
      return false;
    } finally {
      setImporting(false);
    }
  }, []);

  const parseCSVDataset = useCallback((csvData: string): StudentProfile[] => {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) throw new Error('Dataset must have at least one data row');

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    return lines.slice(1).filter(line => line.trim()).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};

      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });

      // Handle different possible column names for roll number and name
      const rollNumber = row['roll number'] || row['rollnumber'] || row['roll_number'] ||
                        row['collegeid'] || row['college_id'] || row['id'] || row['student_id'];
      const studentName = row['name'] || row['student_name'] || row['fullname'] || row['full_name'];

      if (!rollNumber) {
        throw new Error(`Row ${index + 2}: Roll number is required`);
      }

      if (!studentName) {
        throw new Error(`Row ${index + 2}: Student name is required`);
      }

      // Use roll number as both collegeId and rollNumber for consistency
      const collegeId = rollNumber;

      // Map CSV columns to StudentProfile structure
      return {
        uid: collegeId,
        name: studentName,
        collegeId: collegeId,
        email: row.email || `${collegeId}@cvr.ac.in`,
        role: 'student' as const,
        year: row.year || '22',
        section: row.section || 'A',
        branch: row.branch || '05',
        rollNumber: rollNumber,
        profile: {
          phone: row.phone || '',
          dateOfBirth: row.dateOfBirth || row['date_of_birth'] || '',
          address: row.address || '',
          bio: row.bio || `Student ${studentName}`,
          academic: {
            cgpa: parseFloat(row.cgpa) || 0,
            semester: parseInt(row.semester) || 1
          }
        }
      } as StudentProfile;
    });
  }, []);

  return {
    importing,
    importError,
    importSuccess,
    importStudentDataset,
    parseCSVDataset
  };
};
