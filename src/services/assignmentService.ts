// Assignment Service - API calls for assignment management

const API_BASE = "http://localhost:5000/api/assignments";

// ==================== FACULTY API ====================

// Get all assignments created by a faculty member
export const getFacultyAssignments = async (facultyId: string) => {
    const response = await fetch(`${API_BASE}/faculty/${facultyId}`);
    if (!response.ok) throw new Error("Failed to fetch assignments");
    return response.json();
};

// Get all assignments (for admin view)
export const getAllAssignments = async () => {
    const response = await fetch(`${API_BASE}/all`);
    if (!response.ok) throw new Error("Failed to fetch assignments");
    return response.json();
};

// Create a new assignment
export const createAssignment = async (data: {
    title: string;
    description: string;
    course: string;
    courseCode: string;
    dueDate: string;
    createdBy: string;
    createdByName?: string;
    section?: string;
    branch?: string;
    year?: string;
    maxMarks?: number;
}) => {
    const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create assignment");
    return response.json();
};

// Update an assignment
export const updateAssignment = async (id: string, data: Partial<{
    title: string;
    description: string;
    course: string;
    courseCode: string;
    dueDate: string;
    status: "Active" | "Completed" | "Draft";
    maxMarks: number;
}>) => {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update assignment");
    return response.json();
};

// Delete an assignment
export const deleteAssignment = async (id: string) => {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete assignment");
    return response.json();
};

// Get submissions for an assignment
export const getSubmissions = async (assignmentId: string) => {
    const response = await fetch(`${API_BASE}/${assignmentId}/submissions`);
    if (!response.ok) throw new Error("Failed to fetch submissions");
    return response.json();
};

// Download a specific submission
export const downloadSubmission = async (assignmentId: string, submissionId: string) => {
    const response = await fetch(
        `${API_BASE}/${assignmentId}/submissions/${submissionId}/download`
    );
    if (!response.ok) throw new Error("Failed to download submission");
    return response.json();
};

// Grade a submission
export const gradeSubmission = async (
    assignmentId: string,
    submissionId: string,
    grade: number,
    feedback?: string
) => {
    const response = await fetch(
        `${API_BASE}/${assignmentId}/submissions/${submissionId}/grade`,
        {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ grade, feedback }),
        }
    );
    if (!response.ok) throw new Error("Failed to grade submission");
    return response.json();
};

// ==================== STUDENT API ====================

// Get assignments for a student (by section)
export const getStudentAssignments = async (section: string, studentId: string) => {
    const response = await fetch(`${API_BASE}/student/${section}/${studentId}`);
    if (!response.ok) throw new Error("Failed to fetch assignments");
    return response.json();
};

// Submit an assignment (upload PDF)
export const submitAssignment = async (
    assignmentId: string,
    data: {
        studentId: string;
        studentName: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        fileData: string; // base64 encoded
    }
) => {
    const response = await fetch(`${API_BASE}/${assignmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to submit assignment");
    return response.json();
};

// Get student's own submission
export const getStudentSubmission = async (assignmentId: string, studentId: string) => {
    const response = await fetch(
        `${API_BASE}/${assignmentId}/student/${studentId}/submission`
    );
    if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch submission");
    }
    return response.json();
};

// ==================== UTILITY FUNCTIONS ====================

// Convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
            const base64 = result.split(",")[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
};

// Convert base64 to Blob for download/preview
export const base64ToBlob = (base64: string, type: string = "application/pdf"): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
};

// Open PDF in new tab
export const openPdfInNewTab = (base64: string, fileName: string) => {
    const blob = base64ToBlob(base64);
    const url = URL.createObjectURL(blob);
    const newTab = window.open(url, "_blank");
    if (newTab) {
        newTab.document.title = fileName;
    }
};

// Download PDF
export const downloadPdf = (base64: string, fileName: string) => {
    const blob = base64ToBlob(base64);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Format file size
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Format date
export const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

// Check if assignment is overdue
export const isOverdue = (dueDate: string | Date): boolean => {
    return new Date() > new Date(dueDate);
};
