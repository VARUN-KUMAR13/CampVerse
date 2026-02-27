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
    degree?: string;
    year: string;
    branch: string;
    section: string;
    semester: string;
    academicYear?: string;
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
    degree: string;
    year: string;
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
    academicYear?: string;
    degree?: string;
    facultyId: string;
    facultyName?: string;
    students: { studentId: string; studentName: string }[];
}): Promise<GradeSheet> => {
    const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        let errMsg = "Failed to create grade sheet";
        try {
            const errData = await response.json();
            errMsg = errData.error || errMsg;
        } catch (e) {
            console.error("Unparseable API error:", e);
        }
        throw new Error(errMsg);
    }
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

// Generate sample students for a section using strict college roll sequences
export const generateStudentsForSection = (
    year: string,
    branch: string,
    section: string,
    count: number = 64
): { studentId: string; studentName: string }[] => {
    // 1. Generate the standard suffix sequence dynamically
    const suffixes: string[] = [];

    // 01 to 99
    for (let i = 1; i <= 99; i++) {
        suffixes.push(i.toString().padStart(2, "0"));
    }
    // A0 to Z9
    for (let i = 65; i <= 90; i++) {
        const char = String.fromCharCode(i);
        for (let j = 0; j <= 9; j++) {
            suffixes.push(`${char}${j}`);
        }
    }
    // AA to ZZ
    for (let i = 65; i <= 90; i++) {
        const char1 = String.fromCharCode(i);
        for (let j = 65; j <= 90; j++) {
            const char2 = String.fromCharCode(j);
            suffixes.push(`${char1}${char2}`);
        }
    }

    // 2. Map branches to their standard codes
    const getBranchCode = (b: string) => {
        switch (b.toUpperCase()) {
            case "CSE": return "05";
            case "ECE": return "04";
            case "EEE": return "02";
            case "MECH": return "03";
            case "IT": return "12";
            case "AI": return "54";
            default: return "05";
        }
    };

    const getYearSuffix = (y: string) => {
        if (y.includes("20")) return y.slice(-2); // Fallback for old forms
        switch (y) {
            case "I Year": return "25";
            case "II Year": return "24";
            case "III Year": return "23";
            case "IV Year": return "22";
            default: return "22";
        }
    };

    const shortYear = getYearSuffix(year);
    const branchCode = getBranchCode(branch);
    const prefix = `${shortYear}B81A${branchCode}`;

    // 3. Calculate sequence bounds for this specific section
    const sectionIndex = section.charCodeAt(0) - 65; // 'A' -> 0, 'B' -> 1
    const startIndex = Math.max(0, sectionIndex) * count;

    // 4. Construct final array
    const students: { studentId: string; studentName: string }[] = [];
    for (let i = 0; i < count; i++) {
        const suffix = suffixes[startIndex + i];
        if (!suffix) break; // Defensive bound check
        students.push({
            studentId: `${prefix}${suffix}`,
            studentName: "", // Will be filled from Firebase/database
        });
    }

    return students;
};
