// Attendance Context - State Management for Attendance System
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    AttendanceRecord,
    AttendanceStatus,
    AttendanceCategory,
    AttendanceRole,
    TimeSlot,
    StudentAttendanceSummary,
    SubjectAttendanceSummary,
    DailyScheduleItem,
    PermissionCheck,
    AttendanceStudent,
    ATTENDANCE_THRESHOLDS,
} from '@/types/attendance';
import {
    getServerTime,
    formatDate,
    formatTime,
    getRoleFromCollegeId,
    getTodaySlots,
    checkMarkingPermission,
    markAttendance,
    markBulkAttendance,
    getStudentAttendanceForDate,
    getSubjectWiseAttendance,
    subscribeToStudentAttendance,
    subscribeToSlotAttendance,
    getStudentsForSection,
    adminOverrideAttendance,
    calculateFourWeekAttendance,
    isSlotOpen,
    timeToMinutes,
} from '@/services/attendanceService';

interface AttendanceContextType {
    // State
    todaySchedule: DailyScheduleItem[];
    subjectAttendance: SubjectAttendanceSummary[];
    fourWeekSummary: StudentAttendanceSummary | null;
    currentSlot: TimeSlot | null;
    slotAttendance: Map<string, AttendanceRecord>;
    isLoading: boolean;
    error: string | null;
    serverTime: Date;
    userRole: AttendanceRole;

    // Student Actions
    refreshStudentAttendance: () => Promise<void>;

    // Faculty Actions
    markStudentAttendance: (
        studentId: string,
        status: AttendanceStatus
    ) => Promise<boolean>;
    submitSlotAttendance: () => Promise<boolean>;

    // Admin Actions
    overrideAttendance: (
        studentIds: string[],
        slotId: string,
        date: string,
        status: AttendanceStatus,
        reason: string
    ) => Promise<boolean>;
    getStudentsList: (section: string) => Promise<AttendanceStudent[]>;

    // Utility
    checkPermission: (slotId: string, category: AttendanceCategory) => Promise<PermissionCheck>;
    setCurrentSlot: (slot: TimeSlot | null) => void;
    getAttendanceStatus: (percentage: number) => 'SATISFACTORY' | 'WARNING' | 'CRITICAL';
}

const AttendanceContext = createContext<AttendanceContextType | null>(null);

export const useAttendance = () => {
    const context = useContext(AttendanceContext);
    if (!context) {
        throw new Error('useAttendance must be used within an AttendanceProvider');
    }
    return context;
};

interface AttendanceProviderProps {
    children: React.ReactNode;
}

export const AttendanceProvider: React.FC<AttendanceProviderProps> = ({ children }) => {
    const { userData } = useAuth();

    // State
    const [todaySchedule, setTodaySchedule] = useState<DailyScheduleItem[]>([]);
    const [subjectAttendance, setSubjectAttendance] = useState<SubjectAttendanceSummary[]>([]);
    const [fourWeekSummary, setFourWeekSummary] = useState<StudentAttendanceSummary | null>(null);
    const [currentSlot, setCurrentSlot] = useState<TimeSlot | null>(null);
    const [slotAttendance, setSlotAttendance] = useState<Map<string, AttendanceRecord>>(new Map());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [serverTime, setServerTime] = useState<Date>(new Date());
    const [userRole, setUserRole] = useState<AttendanceRole>('STUDENT');

    // Determine user role
    useEffect(() => {
        if (userData?.collegeId) {
            const role = getRoleFromCollegeId(userData.collegeId);
            setUserRole(role);
        }
    }, [userData?.collegeId]);

    // Server time sync
    useEffect(() => {
        const syncServerTime = async () => {
            try {
                const time = await getServerTime();
                setServerTime(time);
            } catch (error) {
                console.error('Failed to sync server time:', error);
            }
        };

        syncServerTime();
        const interval = setInterval(syncServerTime, 60000); // Sync every minute

        return () => clearInterval(interval);
    }, []);

    // Load today's schedule for students
    useEffect(() => {
        if (userData?.collegeId && userRole === 'STUDENT') {
            loadTodaySchedule();
        }
    }, [userData?.collegeId, userRole]);

    // Real-time subscription for student attendance
    useEffect(() => {
        if (!userData?.collegeId || userRole !== 'STUDENT') return;

        const today = formatDate(serverTime);
        const section = userData.section || 'A';
        const branch = userData.branch || '05';
        const year = userData.year || '22';

        const unsubscribe = subscribeToStudentAttendance(
            userData.collegeId,
            today,
            year,
            branch,
            section,
            (records) => {
                updateScheduleWithAttendance(records);
            }
        );

        return () => unsubscribe();
    }, [userData?.collegeId, userRole, serverTime]);

    // Real-time subscription for slot attendance (faculty)
    useEffect(() => {
        if (!userData?.collegeId || userRole !== 'FACULTY' || !currentSlot) return;

        const today = formatDate(serverTime);
        const section = currentSlot.section || 'A';
        const branch = currentSlot.branch || '05';
        const year = currentSlot.year || '22';

        const unsubscribe = subscribeToSlotAttendance(
            currentSlot.id,
            today,
            year,
            branch,
            section,
            (records) => {
                const recordMap = new Map<string, AttendanceRecord>();
                records.forEach(record => {
                    recordMap.set(record.studentId, record);
                });
                setSlotAttendance(recordMap);
            }
        );

        return () => unsubscribe();
    }, [userData?.collegeId, userRole, currentSlot, serverTime]);

    const loadTodaySchedule = async () => {
        if (!userData) return;

        setIsLoading(true);
        setError(null);

        try {
            const section = userData.section || 'A';
            const branch = userData.branch || '05';
            const year = userData.year || '22';

            const slots = await getTodaySlots(section, branch, year);
            const currentTime = formatTime(serverTime);

            // Mock schedule data for development
            const scheduleItems: DailyScheduleItem[] = [
                {
                    slotId: 'slot_1',
                    slotNumber: 1,
                    time: '9:00 AM - 12:10 PM',
                    subjectCode: '22CS401',
                    subjectName: 'Linux Programming',
                    status: 'NOT_MARKED',
                    isSlotOpen: isSlotOpen(currentTime, '12:10', 15),
                    canMark: false,
                },
                {
                    slotId: 'slot_2',
                    slotNumber: 2,
                    time: '12:10 PM - 1:10 PM',
                    subjectCode: '22HS301',
                    subjectName: 'Business Economics and Financial Analysis',
                    status: 'NOT_MARKED',
                    isSlotOpen: isSlotOpen(currentTime, '13:10', 15),
                    canMark: false,
                },
                {
                    slotId: 'slot_3',
                    slotNumber: 3,
                    time: '1:55 PM - 2:55 PM',
                    subjectCode: '22HS501',
                    subjectName: 'Professional Elective-III',
                    status: 'NOT_MARKED',
                    isSlotOpen: isSlotOpen(currentTime, '14:55', 15),
                    canMark: false,
                },
                {
                    slotId: 'slot_4',
                    slotNumber: 4,
                    time: '2:55 PM - 3:55 PM',
                    subjectCode: '22HS601',
                    subjectName: 'Professional Elective-IV',
                    status: 'NOT_MARKED',
                    isSlotOpen: isSlotOpen(currentTime, '15:55', 15),
                    canMark: false,
                },
            ];

            setTodaySchedule(scheduleItems);

            // Load subject-wise attendance
            const subjectWise = await getSubjectWiseAttendance(
                userData.collegeId,
                year,
                branch,
                section
            );
            setSubjectAttendance(subjectWise);

            // Load 4-week summary
            const summary = await calculateFourWeekAttendance(
                userData.collegeId,
                year,
                branch,
                section
            );
            setFourWeekSummary(summary);

        } catch (err: any) {
            setError(err.message || 'Failed to load attendance data');
            console.error('Error loading attendance:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateScheduleWithAttendance = (records: AttendanceRecord[]) => {
        setTodaySchedule(prev => {
            return prev.map(item => {
                const record = records.find(r => r.slotId === item.slotId);
                if (record) {
                    return {
                        ...item,
                        status: record.status,
                        markedAt: record.markedAt,
                        markedBy: record.markedBy,
                    };
                }
                return item;
            });
        });
    };

    const refreshStudentAttendance = async () => {
        await loadTodaySchedule();
    };

    const markStudentAttendance = async (
        studentId: string,
        status: AttendanceStatus
    ): Promise<boolean> => {
        if (!userData?.collegeId || !currentSlot) return false;

        try {
            const today = formatDate(serverTime);
            const record = await markAttendance(
                studentId,
                currentSlot.id,
                today,
                status,
                'ACADEMIC',
                userData.collegeId,
                userRole,
                currentSlot.subjectCode,
                currentSlot.subjectName,
                currentSlot.section,
                currentSlot.branch,
                currentSlot.year,
                false
            );

            return record !== null;
        } catch (error) {
            console.error('Error marking attendance:', error);
            return false;
        }
    };

    const submitSlotAttendance = async (): Promise<boolean> => {
        if (!userData?.collegeId || !currentSlot) return false;

        // This would normally sync all pending attendance marks
        // For now, just return true as marks are saved in real-time
        return true;
    };

    const overrideAttendance = async (
        studentIds: string[],
        slotId: string,
        date: string,
        status: AttendanceStatus,
        reason: string
    ): Promise<boolean> => {
        if (!userData?.collegeId || userRole !== 'ADMIN') return false;

        try {
            const result = await adminOverrideAttendance(
                studentIds,
                slotId,
                date,
                status,
                reason,
                userData.collegeId,
                currentSlot?.subjectCode || 'OVERRIDE',
                currentSlot?.subjectName || 'Admin Override',
                currentSlot?.section || 'A',
                currentSlot?.branch || '05',
                currentSlot?.year || '22'
            );

            return result.success;
        } catch (error) {
            console.error('Error overriding attendance:', error);
            return false;
        }
    };

    const getStudentsList = async (section: string): Promise<AttendanceStudent[]> => {
        const year = userData?.year || '22';
        const branch = userData?.branch || '05';
        return getStudentsForSection(year, branch, section);
    };

    const checkPermission = async (
        slotId: string,
        category: AttendanceCategory
    ): Promise<PermissionCheck> => {
        if (!userData?.collegeId) {
            return {
                canMark: false,
                reason: 'User not logged in',
                isTimeValid: false,
                isSlotOpen: false,
                hasPermission: false,
            };
        }

        const today = formatDate(serverTime);
        return checkMarkingPermission(
            userData.collegeId,
            userRole,
            slotId,
            today,
            category
        );
    };

    const getAttendanceStatus = (percentage: number): 'SATISFACTORY' | 'WARNING' | 'CRITICAL' => {
        if (percentage >= ATTENDANCE_THRESHOLDS.SATISFACTORY) return 'SATISFACTORY';
        if (percentage >= ATTENDANCE_THRESHOLDS.WARNING) return 'WARNING';
        return 'CRITICAL';
    };

    const value: AttendanceContextType = {
        todaySchedule,
        subjectAttendance,
        fourWeekSummary,
        currentSlot,
        slotAttendance,
        isLoading,
        error,
        serverTime,
        userRole,
        refreshStudentAttendance,
        markStudentAttendance,
        submitSlotAttendance,
        overrideAttendance,
        getStudentsList,
        checkPermission,
        setCurrentSlot,
        getAttendanceStatus,
    };

    return (
        <AttendanceContext.Provider value={value}>
            {children}
        </AttendanceContext.Provider>
    );
};

export default AttendanceContext;
