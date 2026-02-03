// Grade Service - API calls for grade management

const API_BASE = "http://localhost:5000/api/grades";

// Types
export type StudentGrade = {
    studentId: string;
    studentName: string;
    mid1: number | null;
    assignment1: number | null;
    mid2: number | null;
    assignment2: number | null;
    project: number | null;
    external: number | null;
    mid1Converted: number | null;
    mid2Converted: number | null;
    mid1Total: number | null;
    mid2Total: number | null;
    internalMarks: number | null;
    totalMarks: number | null;
    grade: string | null;
    gradePoints: number | null;
};

export type GradeSheet = {
    _id: string;
    subjectCode: string;
    subjectName: string;
    credits: number;
    year: string;
    branch: string;
    section: string;
    semester: string;
    academicYear: string;
    facultyId: string;
    facultyName: string;
    studentGrades: StudentGrade[];
    studentCount: number;
    status: "Draft" | "Submitted" | "Published";
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
    publishedBy: string | null;
};

export type StudentResult = {
    subjectCode: string;
    subjectName: string;
    credits: number;
    semester: string;
    academicYear: string;
    facultyName: string;
    grades: {
        mid1: number | null;
        mid1Converted: number | null;
        assignment1: number | null;
        mid1Total: number | null;
        mid2: number | null;
        mid2Converted: number | null;
        assignment2: number | null;
        mid2Total: number | null;
        project: number | null;
        internalMarks: number | null;
        external: number | null;
        totalMarks: number | null;
        grade: string | null;
        gradePoints: number | null;
    } | null;
    publishedAt: string;
};

// ==================== FACULTY API ====================

// Get all grade sheets for a faculty
export const getFacultyGradeSheets = async (
    facultyId: string
): Promise<GradeSheet[]> => {
    const response = await fetch(`${API_BASE}/faculty/${facultyId}`);
    if (!response.ok) throw new Error("Failed to fetch grade sheets");
    return response.json();
};

// Get a single grade sheet with all student grades
export const getGradeSheet = async (id: string): Promise<GradeSheet> => {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch grade sheet");
    return response.json();
};

// Create a new grade sheet
export const createGradeSheet = async (data: {
    subjectCode: string;
    subjectName: string;
    credits?: number;
    year: string;
    branch: string;
    section: string;
    semester: string;
    academicYear: string;
    facultyId: string;
    facultyName?: string;
    students: { studentId: string; studentName: string }[];
}): Promise<GradeSheet> => {
    const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create grade sheet");
    return response.json();
};

// Update student grades
export const updateGrades = async (
    sheetId: string,
    studentGrades: Partial<StudentGrade>[]
): Promise<GradeSheet> => {
    const response = await fetch(`${API_BASE}/${sheetId}/grades`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentGrades }),
    });
    if (!response.ok) throw new Error("Failed to update grades");
    return response.json();
};

// Submit grade sheet to admin
export const submitGradeSheet = async (sheetId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${sheetId}/submit`, {
        method: "PUT",
    });
    if (!response.ok) throw new Error("Failed to submit grade sheet");
};

// Delete grade sheet
export const deleteGradeSheet = async (sheetId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${sheetId}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete grade sheet");
};

// ==================== ADMIN API ====================

// Get all submitted grade sheets (for admin)
export const getSubmittedGradeSheets = async (): Promise<GradeSheet[]> => {
    const response = await fetch(`${API_BASE}/admin/submitted`);
    if (!response.ok) throw new Error("Failed to fetch submitted grade sheets");
    return response.json();
};

// Add external marks (admin)
export const addExternalMarks = async (
    sheetId: string,
    studentGrades: { studentId: string; external: number }[]
): Promise<GradeSheet> => {
    const response = await fetch(`${API_BASE}/${sheetId}/external`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentGrades }),
    });
    if (!response.ok) throw new Error("Failed to update external marks");
    return response.json();
};

// Publish results (admin)
export const publishResults = async (
    sheetId: string,
    adminId: string
): Promise<void> => {
    const response = await fetch(`${API_BASE}/${sheetId}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId }),
    });
    if (!response.ok) throw new Error("Failed to publish results");
};

// ==================== STUDENT API ====================

// Get student's results
export const getStudentResults = async (
    studentId: string
): Promise<StudentResult[]> => {
    const response = await fetch(`${API_BASE}/student/${studentId}`);
    if (!response.ok) throw new Error("Failed to fetch results");
    return response.json();
};

// ==================== UTILITY FUNCTIONS ====================

// Calculate converted marks
export const calculateMid1Converted = (mid1: number | null): number | null => {
    if (mid1 === null) return null;
    return Math.round(mid1 * 0.75 * 100) / 100;
};

export const calculateMid2Converted = (mid2: number | null): number | null => {
    if (mid2 === null) return null;
    return Math.round(mid2 * 0.75 * 100) / 100;
};

export const calculateMid1Total = (
    mid1Converted: number | null,
    assignment1: number | null
): number | null => {
    if (mid1Converted === null || assignment1 === null) return null;
    return mid1Converted + assignment1;
};

export const calculateMid2Total = (
    mid2Converted: number | null,
    assignment2: number | null
): number | null => {
    if (mid2Converted === null || assignment2 === null) return null;
    return mid2Converted + assignment2;
};

export const calculateInternalMarks = (
    mid1Total: number | null,
    mid2Total: number | null,
    project: number | null
): number | null => {
    if (mid1Total === null || mid2Total === null || project === null) return null;
    const average = (mid1Total + mid2Total) / 2;
    return Math.round((average + project) * 100) / 100;
};

export const calculateTotalMarks = (
    internalMarks: number | null,
    external: number | null
): number | null => {
    if (internalMarks === null || external === null) return null;
    return internalMarks + external;
};

export const calculateGrade = (
    totalMarks: number | null
): { grade: string; gradePoints: number } | null => {
    if (totalMarks === null) return null;
    if (totalMarks >= 90) return { grade: "O", gradePoints: 10 };
    if (totalMarks >= 80) return { grade: "A+", gradePoints: 9 };
    if (totalMarks >= 70) return { grade: "A", gradePoints: 8 };
    if (totalMarks >= 60) return { grade: "B+", gradePoints: 7 };
    if (totalMarks >= 50) return { grade: "B", gradePoints: 6 };
    if (totalMarks >= 40) return { grade: "C", gradePoints: 5 };
    return { grade: "F", gradePoints: 0 };
};

// Generate sample students for a section
export const generateStudentsForSection = (
    section: string,
    count: number = 64
): { studentId: string; studentName: string }[] => {
    const students: { studentId: string; studentName: string }[] = [];
    const sectionOffsets: Record<string, number> = {
        A: 0x01,
        B: 0x65,
        C: 0xc9,
        D: 0x12d,
        E: 0x191,
        F: 0x1f5,
        G: 0x259,
    };

    const startOffset = sectionOffsets[section] || 0x01;
    for (let i = 0; i < count; i++) {
        const hexNum = (startOffset + i).toString(16).toUpperCase().padStart(2, "0");
        students.push({
            studentId: `22B81A05${hexNum}`,
            studentName: "", // Will be filled from Firebase/database
        });
    }

    return students;
};
