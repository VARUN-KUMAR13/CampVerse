// Attendance System Types

// Attendance Categories
export type AttendanceCategory = 'ACADEMIC' | 'EVENT' | 'SPORTS' | 'CLUB';

// Attendance Status
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'NOT_MARKED';

// User Roles for Attendance Permissions
export type AttendanceRole = 'ADMIN' | 'FACULTY' | 'STUDENT' | 'SUB_ADMIN' | 'COORDINATOR';

// Slot Status
export type SlotStatus = 'OPEN' | 'LOCKED' | 'OVERRIDE';

// Time Slot Interface
export interface TimeSlot {
    id: string;
    slotNumber: number;
    startTime: string; // HH:MM format (24hr)
    endTime: string;   // HH:MM format (24hr)
    subjectCode: string;
    subjectName: string;
    facultyId: string;
    section: string;
    branch: string;
    year: string;
}

// Attendance Record
export interface AttendanceRecord {
    id: string;
    studentId: string;
    date: string; // YYYY-MM-DD format
    slotId: string;
    slotNumber: number;
    status: AttendanceStatus;
    category: AttendanceCategory;
    markedBy: string; // userId who marked attendance
    markedByRole: AttendanceRole;
    markedAt: number; // timestamp
    isOverride: boolean;
    overrideReason?: string;
    subjectCode: string;
    subjectName: string;
    section: string;
    branch: string;
    year: string;
}

// Student Attendance Summary
export interface StudentAttendanceSummary {
    studentId: string;
    studentName: string;
    totalClasses: number;
    attended: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
    category: AttendanceCategory;
    subjectCode?: string;
    period: {
        startDate: string;
        endDate: string;
        weeks: number;
    };
}

// Subject Attendance Summary
export interface SubjectAttendanceSummary {
    subjectCode: string;
    subjectName: string;
    totalClasses: number;
    attended: number;
    percentage: number;
    status: 'SATISFACTORY' | 'WARNING' | 'CRITICAL';
}

// Daily Schedule with Attendance
export interface DailyScheduleItem {
    slotId: string;
    slotNumber: number;
    time: string;
    subjectCode: string;
    subjectName: string;
    status: AttendanceStatus;
    isSlotOpen: boolean;
    canMark: boolean;
    markedAt?: number;
    markedBy?: string;
}

// Slot Lock State
export interface SlotLockState {
    slotId: string;
    date: string;
    status: SlotStatus;
    lockedAt?: number;
    lockedBy?: string;
    overrideBy?: string;
    overrideReason?: string;
}

// Permission Check Result
export interface PermissionCheck {
    canMark: boolean;
    reason: string;
    isTimeValid: boolean;
    isSlotOpen: boolean;
    hasPermission: boolean;
}

// Attendance Marking Request
export interface AttendanceMarkRequest {
    studentIds: string[];
    slotId: string;
    date: string;
    status: AttendanceStatus;
    category: AttendanceCategory;
    overrideReason?: string;
}

// Bulk Attendance Response
export interface BulkAttendanceResponse {
    success: boolean;
    markedCount: number;
    failedCount: number;
    errors: Array<{
        studentId: string;
        error: string;
    }>;
}

// Course for Attendance
export interface AttendanceCourse {
    code: string;
    name: string;
    section: string;
    branch: string;
    year: string;
    facultyId: string;
    facultyName: string;
}

// Student for Attendance Marking
export interface AttendanceStudent {
    rollNumber: string;
    name: string;
    section: string;
    branch: string;
    year: string;
    currentStatus?: AttendanceStatus;
    lastUpdated?: string;
}

// Server Time Response
export interface ServerTimeResponse {
    timestamp: number;
    date: string;
    time: string;
    timezone: string;
}

// Attendance Statistics
export interface AttendanceStatistics {
    overall: {
        totalStudents: number;
        averageAttendance: number;
        belowThreshold: number;
        threshold: number;
    };
    bySubject: SubjectAttendanceSummary[];
    byCategory: {
        category: AttendanceCategory;
        totalSessions: number;
        averageAttendance: number;
    }[];
    trends: {
        date: string;
        percentage: number;
    }[];
}

// Slot Configuration
export interface SlotConfig {
    slots: TimeSlot[];
    lockBuffer: number; // minutes after end time to lock
    timezone: string;
}

// Firebase Realtime DB Paths
export const ATTENDANCE_PATHS = {
    RECORDS: 'attendance/records',
    SLOTS: 'attendance/slots',
    SLOT_LOCKS: 'attendance/slotLocks',
    SUBJECTS: 'attendance/subjects',
    CONFIG: 'attendance/config',
    STUDENT_SUMMARY: 'attendance/studentSummary',
    SERVER_TIME: '.info/serverTimeOffset',
} as const;

// Default Time Slots for Academic Day
export const DEFAULT_ACADEMIC_SLOTS: Omit<TimeSlot, 'id' | 'subjectCode' | 'subjectName' | 'facultyId' | 'section' | 'branch' | 'year'>[] = [
    { slotNumber: 1, startTime: '09:00', endTime: '10:00' },
    { slotNumber: 2, startTime: '10:00', endTime: '11:00' },
    { slotNumber: 3, startTime: '11:15', endTime: '12:15' },
    { slotNumber: 4, startTime: '12:15', endTime: '13:15' },
    { slotNumber: 5, startTime: '14:00', endTime: '15:00' },
    { slotNumber: 6, startTime: '15:00', endTime: '16:00' },
];

// Attendance Threshold Constants
export const ATTENDANCE_THRESHOLDS = {
    SATISFACTORY: 75,
    WARNING: 65,
    CRITICAL: 50,
} as const;

// Role Permissions
export const ROLE_PERMISSIONS: Record<AttendanceRole, {
    canMarkAcademic: boolean;
    canMarkEvent: boolean;
    canMarkSports: boolean;
    canMarkClub: boolean;
    canOverride: boolean;
    canViewAll: boolean;
    isTimeBound: boolean;
}> = {
    ADMIN: {
        canMarkAcademic: true,
        canMarkEvent: true,
        canMarkSports: true,
        canMarkClub: true,
        canOverride: true,
        canViewAll: true,
        isTimeBound: false,
    },
    SUB_ADMIN: {
        canMarkAcademic: true,
        canMarkEvent: true,
        canMarkSports: true,
        canMarkClub: true,
        canOverride: false,
        canViewAll: true,
        isTimeBound: false,
    },
    FACULTY: {
        canMarkAcademic: true,
        canMarkEvent: false,
        canMarkSports: false,
        canMarkClub: false,
        canOverride: false,
        canViewAll: false,
        isTimeBound: true,
    },
    COORDINATOR: {
        canMarkAcademic: false,
        canMarkEvent: true,
        canMarkSports: true,
        canMarkClub: true,
        canOverride: false,
        canViewAll: false,
        isTimeBound: false,
    },
    STUDENT: {
        canMarkAcademic: false,
        canMarkEvent: false,
        canMarkSports: false,
        canMarkClub: false,
        canOverride: false,
        canViewAll: false,
        isTimeBound: false,
    },
};
