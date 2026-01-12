import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '@/lib/api';

// Exam interface
export interface Exam {
    _id: string;
    exam_id: string;
    title: string;
    course: string;
    courseCode?: string;
    examType: 'Mid-Term' | 'End-Term' | 'Quiz' | 'Practical' | 'Viva' | 'Assignment' | 'Other';
    date: string;
    startTime: string;
    endTime: string;
    duration?: string;
    venue?: string;
    maxMarks?: number;
    passingMarks?: number;
    description?: string;
    instructions?: string;
    syllabus?: string;
    targetAudience?: {
        branches?: string[];
        sections?: string[];
        years?: string[];
        semesters?: string[];
    };
    faculty?: {
        name?: string;
        email?: string;
        department?: string;
    };
    status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Postponed' | 'Cancelled';
    createdAt: string;
    updatedAt: string;
    postedBy: string;
}

interface ExamContextType {
    exams: Exam[];
    upcomingExams: Exam[];
    loading: boolean;
    error: string | null;
    fetchExams: () => Promise<void>;
    fetchUpcomingExams: () => Promise<void>;
    addExam: (examData: Omit<Exam, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateExam: (id: string, examData: Partial<Exam>) => Promise<void>;
    updateExamStatus: (id: string, status: Exam['status']) => Promise<void>;
    deleteExam: (id: string) => Promise<void>;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const useExams = () => {
    const context = useContext(ExamContext);
    if (!context) {
        throw new Error('useExams must be used within an ExamProvider');
    }
    return context;
};

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all exams
    const fetchExams = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.get('/exams');
            setExams(data);
        } catch (err: any) {
            console.error('Error fetching exams:', err);
            setError(err.message || 'Failed to fetch exams');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch upcoming exams (for students)
    const fetchUpcomingExams = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.get('/exams/upcoming');
            setUpcomingExams(data);
        } catch (err: any) {
            console.error('Error fetching upcoming exams:', err);
            setError(err.message || 'Failed to fetch upcoming exams');
        } finally {
            setLoading(false);
        }
    }, []);

    // Add new exam
    const addExam = async (examData: Omit<Exam, '_id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setError(null);
            const newExam = await api.post('/exams', examData);
            setExams(prev => [newExam, ...prev]);

            // Also update upcoming exams if applicable
            const examDate = new Date(examData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (examDate >= today && examData.status !== 'Cancelled' && examData.status !== 'Completed') {
                setUpcomingExams(prev => [...prev, newExam].sort((a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                ));
            }
        } catch (err: any) {
            console.error('Error adding exam:', err);
            setError(err.message || 'Failed to add exam');
            throw err;
        }
    };

    // Update exam
    const updateExam = async (id: string, examData: Partial<Exam>) => {
        try {
            setError(null);
            const updatedExam = await api.put(`/exams/${id}`, examData);
            setExams(prev => prev.map(exam => exam._id === id ? updatedExam : exam));
            setUpcomingExams(prev => prev.map(exam => exam._id === id ? updatedExam : exam));
        } catch (err: any) {
            console.error('Error updating exam:', err);
            setError(err.message || 'Failed to update exam');
            throw err;
        }
    };

    // Update exam status
    const updateExamStatus = async (id: string, status: Exam['status']) => {
        try {
            setError(null);
            const updatedExam = await api.patch(`/exams/${id}/status`, { status });
            setExams(prev => prev.map(exam => exam._id === id ? updatedExam : exam));

            // Remove from upcoming if completed or cancelled
            if (status === 'Completed' || status === 'Cancelled') {
                setUpcomingExams(prev => prev.filter(exam => exam._id !== id));
            } else {
                setUpcomingExams(prev => prev.map(exam => exam._id === id ? updatedExam : exam));
            }
        } catch (err: any) {
            console.error('Error updating exam status:', err);
            setError(err.message || 'Failed to update exam status');
            throw err;
        }
    };

    // Delete exam
    const deleteExam = async (id: string) => {
        try {
            setError(null);
            await api.delete(`/exams/${id}`);
            setExams(prev => prev.filter(exam => exam._id !== id));
            setUpcomingExams(prev => prev.filter(exam => exam._id !== id));
        } catch (err: any) {
            console.error('Error deleting exam:', err);
            setError(err.message || 'Failed to delete exam');
            throw err;
        }
    };

    const value = {
        exams,
        upcomingExams,
        loading,
        error,
        fetchExams,
        fetchUpcomingExams,
        addExam,
        updateExam,
        updateExamStatus,
        deleteExam,
    };

    return (
        <ExamContext.Provider value={value}>
            {children}
        </ExamContext.Provider>
    );
};

export default ExamContext;
