import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  onSnapshot,
  type DocumentData,
  type QuerySnapshot,
  serverTimestamp
} from 'firebase/firestore';
import app, { firestore as db, isDevelopment, firebaseReady } from '@/lib/firebase';
import { CollegeUser } from '@/lib/auth';

// Mock data storage for development mode
const mockStorage: Record<string, any> = {};

// Student Profile Interface
export interface StudentProfile extends CollegeUser {
  profile?: {
    phone?: string;
    dateOfBirth?: string;
    address?: string;
    bio?: string;
    avatar?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relation: string;
    };
    academic?: {
      cgpa?: number;
      semester?: number;
      specialization?: string;
    };
  };
  enrolledCourses?: string[];
  createdAt?: any;
  updatedAt?: any;
}

// Course Interface
export interface Course {
  id?: string;
  name: string;
  code: string;
  credits: number;
  faculty: string;
  semester: number;
  branch: string;
  description?: string;
  enrolledStudents?: string[];
  createdAt?: any;
  updatedAt?: any;
}

// Assignment Interface
export interface Assignment {
  id?: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  totalMarks: number;
  assignmentType: 'homework' | 'quiz' | 'project' | 'exam';
  submissions?: AssignmentSubmission[];
  createdAt?: any;
  updatedAt?: any;
}

// Assignment Submission Interface
export interface AssignmentSubmission {
  studentId: string;
  studentName: string;
  submittedAt: any;
  score?: number;
  feedback?: string;
  fileUrl?: string;
  status: 'submitted' | 'graded' | 'pending';
}

// Development mode helpers
const getMockKey = (collection: string, id?: string) =>
  id ? `${collection}/${id}` : collection;

const generateId = () => Math.random().toString(36).substr(2, 9);

// Generic Firestore operations
class FirestoreService {
  // Create or update document
  async setDocument(collectionName: string, docId: string, data: any): Promise<void> {
    if (isDevelopment) {
      mockStorage[getMockKey(collectionName, docId)] = {
        ...data,
        id: docId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return;
    }

    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  // Get document by ID
  async getDocument(collectionName: string, docId: string): Promise<any | null> {
    if (isDevelopment) {
      return mockStorage[getMockKey(collectionName, docId)] || null;
    }

    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  // Update document
  async updateDocument(collectionName: string, docId: string, data: any): Promise<void> {
    if (isDevelopment) {
      const existing = mockStorage[getMockKey(collectionName, docId)];
      if (existing) {
        mockStorage[getMockKey(collectionName, docId)] = {
          ...existing,
          ...data,
          updatedAt: new Date()
        };
      }
      return;
    }

    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }

  // Delete document
  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    if (isDevelopment) {
      delete mockStorage[getMockKey(collectionName, docId)];
      return;
    }

    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  }

  // Query documents
  async queryDocuments(
    collectionName: string,
    whereClause?: { field: string; operator: any; value: any },
    orderByClause?: { field: string; direction?: 'asc' | 'desc' }
  ): Promise<any[]> {
    if (isDevelopment) {
      let results = Object.values(mockStorage).filter(item =>
        typeof item === 'object' && item !== null
      );

      if (whereClause) {
        results = results.filter(item => {
          const fieldValue = item[whereClause.field];
          switch (whereClause.operator) {
            case '==': return fieldValue === whereClause.value;
            case '!=': return fieldValue !== whereClause.value;
            case '>': return fieldValue > whereClause.value;
            case '>=': return fieldValue >= whereClause.value;
            case '<': return fieldValue < whereClause.value;
            case '<=': return fieldValue <= whereClause.value;
            case 'array-contains': return Array.isArray(fieldValue) && fieldValue.includes(whereClause.value);
            default: return true;
          }
        });
      }

      if (orderByClause) {
        results.sort((a, b) => {
          const aVal = a[orderByClause.field];
          const bVal = b[orderByClause.field];
          const direction = orderByClause.direction === 'desc' ? -1 : 1;
          return aVal > bVal ? direction : aVal < bVal ? -direction : 0;
        });
      }

      return results;
    }

    if (!db) throw new Error('Firestore not initialized');

    let q = collection(db, collectionName);

    if (whereClause) {
      q = query(q, where(whereClause.field, whereClause.operator, whereClause.value)) as any;
    }

    if (orderByClause) {
      q = query(q, orderBy(orderByClause.field, orderByClause.direction || 'asc')) as any;
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Add document with auto-generated ID
  async addDocument(collectionName: string, data: any): Promise<string> {
    if (isDevelopment) {
      const id = generateId();
      mockStorage[getMockKey(collectionName, id)] = {
        ...data,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return id;
    }

    if (!db) throw new Error('Firestore not initialized');

    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  }

  // Real-time listener
  subscribeToDocument(
    collectionName: string,
    docId: string,
    callback: (data: any) => void
  ): () => void {
    if (isDevelopment) {
      // Simulate real-time updates in development
      const data = mockStorage[getMockKey(collectionName, docId)];
      callback(data);
      return () => { }; // Return empty unsubscribe function
    }

    if (!db) throw new Error('Firestore not initialized');

    const docRef = doc(db, collectionName, docId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  }
}

// Create service instance
const firestoreService = new FirestoreService();

// Student-specific operations
export class StudentService {
  // Create or update student profile
  static async saveStudentProfile(studentData: StudentProfile): Promise<void> {
    if (!studentData.uid) {
      throw new Error('Student UID is required');
    }

    await firestoreService.setDocument('users', studentData.uid, {
      ...studentData,
      updatedAt: isDevelopment ? new Date() : serverTimestamp()
    });
  }

  // Get student profile
  static async getStudentProfile(studentId: string): Promise<StudentProfile | null> {
    return await firestoreService.getDocument('users', studentId);
  }

  // Update student profile
  static async updateStudentProfile(studentId: string, updates: Partial<StudentProfile>): Promise<void> {
    await firestoreService.updateDocument('users', studentId, updates);
  }

  // Get students by branch and year
  static async getStudentsByBranch(branch: string, year: string): Promise<StudentProfile[]> {
    return await firestoreService.queryDocuments(
      'users',
      { field: 'branch', operator: '==', value: branch }
    );
  }

  // Get all students
  static async getAllStudents(): Promise<StudentProfile[]> {
    return await firestoreService.queryDocuments(
      'users',
      { field: 'role', operator: '==', value: 'student' },
      { field: 'name', direction: 'asc' }
    );
  }

  // Bulk import students from dataset
  static async importStudentsFromDataset(students: StudentProfile[]): Promise<void> {
    const promises = students.map(student =>
      this.saveStudentProfile({
        ...student,
        createdAt: isDevelopment ? new Date() : serverTimestamp()
      })
    );

    await Promise.all(promises);
  }
}

// Course-specific operations
export class CourseService {
  // Create course
  static async createCourse(courseData: Course): Promise<string> {
    return await firestoreService.addDocument('courses', {
      ...courseData,
      enrolledStudents: courseData.enrolledStudents || []
    });
  }

  // Get course by ID
  static async getCourse(courseId: string): Promise<Course | null> {
    return await firestoreService.getDocument('courses', courseId);
  }

  // Get courses by semester and branch
  static async getCoursesByBranch(branch: string, semester: number): Promise<Course[]> {
    return await firestoreService.queryDocuments(
      'courses',
      { field: 'branch', operator: '==', value: branch }
    );
  }

  // Enroll student in course
  static async enrollStudent(courseId: string, studentId: string): Promise<void> {
    const course = await this.getCourse(courseId);
    if (course) {
      const enrolledStudents = course.enrolledStudents || [];
      if (!enrolledStudents.includes(studentId)) {
        enrolledStudents.push(studentId);
        await firestoreService.updateDocument('courses', courseId, {
          enrolledStudents
        });
      }
    }
  }
}

// Assignment-specific operations
export class AssignmentService {
  // Create assignment
  static async createAssignment(assignmentData: Assignment): Promise<string> {
    return await firestoreService.addDocument('assignments', assignmentData);
  }

  // Get assignments for a course
  static async getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    return await firestoreService.queryDocuments(
      'assignments',
      { field: 'courseId', operator: '==', value: courseId },
      { field: 'dueDate', direction: 'desc' }
    );
  }

  // Submit assignment
  static async submitAssignment(
    assignmentId: string,
    submission: AssignmentSubmission
  ): Promise<void> {
    const assignment = await firestoreService.getDocument('assignments', assignmentId);
    if (assignment) {
      const submissions = assignment.submissions || [];
      const existingIndex = submissions.findIndex((s: AssignmentSubmission) =>
        s.studentId === submission.studentId
      );

      if (existingIndex >= 0) {
        submissions[existingIndex] = submission;
      } else {
        submissions.push(submission);
      }

      await firestoreService.updateDocument('assignments', assignmentId, {
        submissions
      });
    }
  }
}

export { firestoreService };
export default FirestoreService;
