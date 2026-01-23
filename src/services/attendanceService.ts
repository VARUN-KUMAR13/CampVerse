// Attendance Service - Firebase Realtime Database Integration
import { database, isDevelopment, firebaseReady } from '@/lib/firebase';
import {
    ref,
    get,
    set,
    push,
    update,
    onValue,
    off,
    serverTimestamp,
    query,
    orderByChild,
    equalTo,
    DataSnapshot,
} from 'firebase/database';
import {
    AttendanceRecord,
    AttendanceStatus,
    AttendanceCategory,
    AttendanceRole,
    TimeSlot,
    SlotLockState,
    StudentAttendanceSummary,
    SubjectAttendanceSummary,
    DailyScheduleItem,
    PermissionCheck,
    AttendanceMarkRequest,
    BulkAttendanceResponse,
    AttendanceStudent,
    AttendanceCourse,
    ATTENDANCE_PATHS,
    DEFAULT_ACADEMIC_SLOTS,
    ATTENDANCE_THRESHOLDS,
    ROLE_PERMISSIONS,
    SlotConfig,
} from '@/types/attendance';

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get current server time with offset
 */
export const getServerTime = async (): Promise<Date> => {
    if (!firebaseReady || !database) {
        return new Date();
    }

    try {
        const offsetRef = ref(database, '.info/serverTimeOffset');
        const snapshot = await get(offsetRef);
        const offset = snapshot.val() || 0;
        return new Date(Date.now() + offset);
    } catch (error) {
        console.error('Error getting server time:', error);
        return new Date();
    }
};

/**
 * Format date to YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

/**
 * Format time to HH:MM
 */
export const formatTime = (date: Date): string => {
    return date.toTimeString().slice(0, 5);
};

/**
 * Parse time string to minutes from midnight
 */
export const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

/**
 * Check if current time is within slot time range
 */
export const isWithinSlotTime = (
    currentTime: string,
    slotStart: string,
    slotEnd: string,
    bufferMinutes: number = 0
): boolean => {
    const current = timeToMinutes(currentTime);
    const start = timeToMinutes(slotStart);
    const end = timeToMinutes(slotEnd) + bufferMinutes;
    return current >= start && current <= end;
};

/**
 * Check if slot is still open for marking
 */
export const isSlotOpen = (
    currentTime: string,
    slotEnd: string,
    bufferMinutes: number = 15
): boolean => {
    const current = timeToMinutes(currentTime);
    const end = timeToMinutes(slotEnd) + bufferMinutes;
    return current <= end;
};

/**
 * Determine user role from college ID
 * Student: 22B81A05C3 (section letter is A-Y)
 * Faculty: 22B81Z05C3 (section letter is Z)
 * Admin: admin
 */
export const getRoleFromCollegeId = (collegeId: string): AttendanceRole => {
    if (collegeId === 'admin') return 'ADMIN';
    if (collegeId.length >= 6 && collegeId[5] === 'Z') return 'FACULTY';
    return 'STUDENT';
};

/**
 * Generate unique attendance record ID
 */
export const generateAttendanceId = (
    studentId: string,
    date: string,
    slotId: string
): string => {
    return `${studentId}_${date}_${slotId}`;
};

// ==================== SLOT MANAGEMENT ====================

/**
 * Get today's slots for a section
 */
export const getTodaySlots = async (
    section: string,
    branch: string,
    year: string
): Promise<TimeSlot[]> => {
    if (!firebaseReady || !database) {
        // Return mock slots for development
        return DEFAULT_ACADEMIC_SLOTS.map((slot, index) => ({
            ...slot,
            id: `slot_${index + 1}`,
            subjectCode: `CS${100 + index}`,
            subjectName: `Subject ${index + 1}`,
            facultyId: 'faculty_1',
            section,
            branch,
            year,
        }));
    }

    try {
        const today = formatDate(await getServerTime());
        const slotsRef = ref(database, `${ATTENDANCE_PATHS.SLOTS}/${year}/${branch}/${section}/${today}`);
        const snapshot = await get(slotsRef);

        if (snapshot.exists()) {
            return Object.values(snapshot.val());
        }

        // Return default slots if no custom slots configured
        return DEFAULT_ACADEMIC_SLOTS.map((slot, index) => ({
            ...slot,
            id: `${today}_slot_${slot.slotNumber}`,
            subjectCode: '',
            subjectName: '',
            facultyId: '',
            section,
            branch,
            year,
        }));
    } catch (error) {
        console.error('Error getting today slots:', error);
        return [];
    }
};

/**
 * Get slot lock state
 */
export const getSlotLockState = async (
    slotId: string,
    date: string
): Promise<SlotLockState | null> => {
    if (!firebaseReady || !database) return null;

    try {
        const lockRef = ref(database, `${ATTENDANCE_PATHS.SLOT_LOCKS}/${date}/${slotId}`);
        const snapshot = await get(lockRef);

        if (snapshot.exists()) {
            return snapshot.val();
        }
        return null;
    } catch (error) {
        console.error('Error getting slot lock state:', error);
        return null;
    }
};

/**
 * Lock a slot (prevent further marking)
 */
export const lockSlot = async (
    slotId: string,
    date: string,
    lockedBy: string
): Promise<boolean> => {
    if (!firebaseReady || !database) return false;

    try {
        const lockRef = ref(database, `${ATTENDANCE_PATHS.SLOT_LOCKS}/${date}/${slotId}`);
        await set(lockRef, {
            slotId,
            date,
            status: 'LOCKED',
            lockedAt: Date.now(),
            lockedBy,
        });
        return true;
    } catch (error) {
        console.error('Error locking slot:', error);
        return false;
    }
};

// ==================== PERMISSION CHECKING ====================

/**
 * Check if user can mark attendance for a slot
 */
export const checkMarkingPermission = async (
    userId: string,
    userRole: AttendanceRole,
    slotId: string,
    date: string,
    category: AttendanceCategory
): Promise<PermissionCheck> => {
    const serverTime = await getServerTime();
    const currentTime = formatTime(serverTime);
    const currentDate = formatDate(serverTime);

    // Get role permissions
    const permissions = ROLE_PERMISSIONS[userRole];

    // Check category permission
    const categoryPermissionMap: Record<AttendanceCategory, keyof typeof permissions> = {
        ACADEMIC: 'canMarkAcademic',
        EVENT: 'canMarkEvent',
        SPORTS: 'canMarkSports',
        CLUB: 'canMarkClub',
    };

    const hasCategoryPermission = permissions[categoryPermissionMap[category]] as boolean;
    if (!hasCategoryPermission) {
        return {
            canMark: false,
            reason: `You don't have permission to mark ${category} attendance`,
            isTimeValid: true,
            isSlotOpen: true,
            hasPermission: false,
        };
    }

    // Students can never mark attendance
    if (userRole === 'STUDENT') {
        return {
            canMark: false,
            reason: 'Students cannot mark attendance',
            isTimeValid: true,
            isSlotOpen: true,
            hasPermission: false,
        };
    }

    // Check if marking for today
    if (date !== currentDate && !permissions.canOverride) {
        return {
            canMark: false,
            reason: 'You can only mark attendance for today',
            isTimeValid: false,
            isSlotOpen: true,
            hasPermission: true,
        };
    }

    // Check slot lock state
    const lockState = await getSlotLockState(slotId, date);
    if (lockState?.status === 'LOCKED' && !permissions.canOverride) {
        return {
            canMark: false,
            reason: 'This slot is locked. Contact admin for override.',
            isTimeValid: true,
            isSlotOpen: false,
            hasPermission: true,
        };
    }

    // For time-bound roles, check slot timing
    if (permissions.isTimeBound && category === 'ACADEMIC') {
        // Get slot details - in real implementation, fetch from DB
        const slotEndTime = '10:00'; // This should come from actual slot data

        if (!isSlotOpen(currentTime, slotEndTime, 15)) {
            return {
                canMark: false,
                reason: 'Slot time has expired. Contact admin for override.',
                isTimeValid: false,
                isSlotOpen: false,
                hasPermission: true,
            };
        }
    }

    return {
        canMark: true,
        reason: 'Permission granted',
        isTimeValid: true,
        isSlotOpen: true,
        hasPermission: true,
    };
};

// ==================== ATTENDANCE MARKING ====================

/**
 * Mark attendance for a single student
 */
export const markAttendance = async (
    studentId: string,
    slotId: string,
    date: string,
    status: AttendanceStatus,
    category: AttendanceCategory,
    markedBy: string,
    markedByRole: AttendanceRole,
    subjectCode: string,
    subjectName: string,
    section: string,
    branch: string,
    year: string,
    isOverride: boolean = false,
    overrideReason?: string
): Promise<AttendanceRecord | null> => {
    const recordId = generateAttendanceId(studentId, date, slotId);

    const record: AttendanceRecord = {
        id: recordId,
        studentId,
        date,
        slotId,
        slotNumber: parseInt(slotId.split('_').pop() || '0'),
        status,
        category,
        markedBy,
        markedByRole,
        markedAt: Date.now(),
        isOverride,
        overrideReason,
        subjectCode,
        subjectName,
        section,
        branch,
        year,
    };

    if (!firebaseReady || !database) {
        // Development mode - store in localStorage
        const storageKey = `attendance_${recordId}`;
        localStorage.setItem(storageKey, JSON.stringify(record));
        console.log('Dev mode: Attendance marked', record);
        return record;
    }

    try {
        const recordRef = ref(database, `${ATTENDANCE_PATHS.RECORDS}/${year}/${branch}/${section}/${date}/${recordId}`);
        await set(recordRef, record);

        // Also update student summary
        await updateStudentSummary(studentId, category, status, year, branch, section);

        return record;
    } catch (error) {
        console.error('Error marking attendance:', error);
        return null;
    }
};

/**
 * Mark attendance for multiple students (bulk)
 */
export const markBulkAttendance = async (
    request: AttendanceMarkRequest,
    markedBy: string,
    markedByRole: AttendanceRole,
    subjectCode: string,
    subjectName: string,
    section: string,
    branch: string,
    year: string
): Promise<BulkAttendanceResponse> => {
    const results: BulkAttendanceResponse = {
        success: true,
        markedCount: 0,
        failedCount: 0,
        errors: [],
    };

    const isOverride = markedByRole === 'ADMIN' || markedByRole === 'SUB_ADMIN';

    for (const studentId of request.studentIds) {
        try {
            const record = await markAttendance(
                studentId,
                request.slotId,
                request.date,
                request.status,
                request.category,
                markedBy,
                markedByRole,
                subjectCode,
                subjectName,
                section,
                branch,
                year,
                isOverride,
                request.overrideReason
            );

            if (record) {
                results.markedCount++;
            } else {
                results.failedCount++;
                results.errors.push({ studentId, error: 'Failed to save record' });
            }
        } catch (error: any) {
            results.failedCount++;
            results.errors.push({ studentId, error: error.message });
        }
    }

    results.success = results.failedCount === 0;
    return results;
};

/**
 * Update student attendance summary
 */
const updateStudentSummary = async (
    studentId: string,
    category: AttendanceCategory,
    status: AttendanceStatus,
    year: string,
    branch: string,
    section: string
): Promise<void> => {
    if (!firebaseReady || !database) return;

    try {
        const summaryRef = ref(
            database,
            `${ATTENDANCE_PATHS.STUDENT_SUMMARY}/${year}/${branch}/${section}/${studentId}/${category}`
        );

        const snapshot = await get(summaryRef);
        const currentSummary = snapshot.exists() ? snapshot.val() : {
            totalClasses: 0,
            attended: 0,
            absent: 0,
            late: 0,
            excused: 0,
        };

        // Update counts
        currentSummary.totalClasses++;
        if (status === 'PRESENT') currentSummary.attended++;
        else if (status === 'ABSENT') currentSummary.absent++;
        else if (status === 'LATE') currentSummary.late++;
        else if (status === 'EXCUSED') currentSummary.excused++;

        // Calculate percentage
        currentSummary.percentage = Math.round(
            ((currentSummary.attended + currentSummary.late * 0.5) / currentSummary.totalClasses) * 100
        );

        await set(summaryRef, currentSummary);
    } catch (error) {
        console.error('Error updating student summary:', error);
    }
};

// ==================== FETCHING ATTENDANCE ====================

/**
 * Get student's attendance for a date
 */
export const getStudentAttendanceForDate = async (
    studentId: string,
    date: string,
    year: string,
    branch: string,
    section: string
): Promise<AttendanceRecord[]> => {
    if (!firebaseReady || !database) {
        // Development mode - return mock data
        return [];
    }

    try {
        const recordsRef = ref(
            database,
            `${ATTENDANCE_PATHS.RECORDS}/${year}/${branch}/${section}/${date}`
        );
        const snapshot = await get(recordsRef);

        if (!snapshot.exists()) return [];

        const allRecords: AttendanceRecord[] = Object.values(snapshot.val());
        return allRecords.filter(record => record.studentId === studentId);
    } catch (error) {
        console.error('Error getting student attendance:', error);
        return [];
    }
};

/**
 * Get all attendance for a slot
 */
export const getSlotAttendance = async (
    slotId: string,
    date: string,
    year: string,
    branch: string,
    section: string
): Promise<AttendanceRecord[]> => {
    if (!firebaseReady || !database) {
        return [];
    }

    try {
        const recordsRef = ref(
            database,
            `${ATTENDANCE_PATHS.RECORDS}/${year}/${branch}/${section}/${date}`
        );
        const snapshot = await get(recordsRef);

        if (!snapshot.exists()) return [];

        const allRecords: AttendanceRecord[] = Object.values(snapshot.val());
        return allRecords.filter(record => record.slotId === slotId);
    } catch (error) {
        console.error('Error getting slot attendance:', error);
        return [];
    }
};

/**
 * Get student's attendance summary by category
 */
export const getStudentAttendanceSummary = async (
    studentId: string,
    category: AttendanceCategory,
    year: string,
    branch: string,
    section: string
): Promise<StudentAttendanceSummary | null> => {
    if (!firebaseReady || !database) {
        // Return mock data for development
        return {
            studentId,
            studentName: 'Student',
            totalClasses: 100,
            attended: 85,
            absent: 10,
            late: 5,
            excused: 0,
            percentage: 85,
            category,
            period: {
                startDate: '2025-01-01',
                endDate: '2026-01-13',
                weeks: 4,
            },
        };
    }

    try {
        const summaryRef = ref(
            database,
            `${ATTENDANCE_PATHS.STUDENT_SUMMARY}/${year}/${branch}/${section}/${studentId}/${category}`
        );
        const snapshot = await get(summaryRef);

        if (!snapshot.exists()) return null;

        return snapshot.val();
    } catch (error) {
        console.error('Error getting student summary:', error);
        return null;
    }
};

/**
 * Get subject-wise attendance summary for student
 */
export const getSubjectWiseAttendance = async (
    studentId: string,
    year: string,
    branch: string,
    section: string
): Promise<SubjectAttendanceSummary[]> => {
    if (!firebaseReady || !database) {
        // Return mock data for development
        return [
            { subjectCode: '22CS401', subjectName: 'Linux Programming', totalClasses: 30, attended: 24, percentage: 80, status: 'SATISFACTORY' },
            { subjectCode: '22HS301', subjectName: 'Business Economics', totalClasses: 28, attended: 22, percentage: 78, status: 'SATISFACTORY' },
            { subjectCode: '22HS501', subjectName: 'Professional Elective III', totalClasses: 25, attended: 20, percentage: 80, status: 'SATISFACTORY' },
            { subjectCode: '22HS601', subjectName: 'Professional Elective IV', totalClasses: 22, attended: 15, percentage: 68, status: 'WARNING' },
        ];
    }

    try {
        // In real implementation, aggregate from records
        const recordsRef = ref(
            database,
            `${ATTENDANCE_PATHS.RECORDS}/${year}/${branch}/${section}`
        );
        const snapshot = await get(recordsRef);

        if (!snapshot.exists()) return [];

        // Aggregate by subject
        const subjectMap = new Map<string, SubjectAttendanceSummary>();

        // Process records...
        // This is a simplified version - in production, use proper aggregation

        return Array.from(subjectMap.values());
    } catch (error) {
        console.error('Error getting subject-wise attendance:', error);
        return [];
    }
};

// ==================== REAL-TIME LISTENERS ====================

/**
 * Subscribe to real-time attendance updates for a student
 */
export const subscribeToStudentAttendance = (
    studentId: string,
    date: string,
    year: string,
    branch: string,
    section: string,
    callback: (records: AttendanceRecord[]) => void
): (() => void) => {
    if (!firebaseReady || !database) {
        console.log('Firebase not ready, using development mode');
        callback([]);
        return () => { };
    }

    const recordsRef = ref(
        database,
        `${ATTENDANCE_PATHS.RECORDS}/${year}/${branch}/${section}/${date}`
    );

    const unsubscribe = onValue(recordsRef, (snapshot) => {
        if (!snapshot.exists()) {
            callback([]);
            return;
        }

        const allRecords: AttendanceRecord[] = Object.values(snapshot.val());
        const studentRecords = allRecords.filter(record => record.studentId === studentId);
        callback(studentRecords);
    });

    return () => off(recordsRef);
};

/**
 * Subscribe to real-time attendance updates for a slot (faculty view)
 */
export const subscribeToSlotAttendance = (
    slotId: string,
    date: string,
    year: string,
    branch: string,
    section: string,
    callback: (records: AttendanceRecord[]) => void
): (() => void) => {
    if (!firebaseReady || !database) {
        callback([]);
        return () => { };
    }

    const recordsRef = ref(
        database,
        `${ATTENDANCE_PATHS.RECORDS}/${year}/${branch}/${section}/${date}`
    );

    const unsubscribe = onValue(recordsRef, (snapshot) => {
        if (!snapshot.exists()) {
            callback([]);
            return;
        }

        const allRecords: AttendanceRecord[] = Object.values(snapshot.val());
        const slotRecords = allRecords.filter(record => record.slotId === slotId);
        callback(slotRecords);
    });

    return () => off(recordsRef);
};

/**
 * Subscribe to attendance summary updates
 */
export const subscribeToAttendanceSummary = (
    studentId: string,
    year: string,
    branch: string,
    section: string,
    callback: (summary: Record<AttendanceCategory, StudentAttendanceSummary>) => void
): (() => void) => {
    if (!firebaseReady || !database) {
        callback({} as any);
        return () => { };
    }

    const summaryRef = ref(
        database,
        `${ATTENDANCE_PATHS.STUDENT_SUMMARY}/${year}/${branch}/${section}/${studentId}`
    );

    const unsubscribe = onValue(summaryRef, (snapshot) => {
        if (!snapshot.exists()) {
            callback({} as any);
            return;
        }
        callback(snapshot.val());
    });

    return () => off(summaryRef);
};

// ==================== ADMIN FUNCTIONS ====================

/**
 * Admin: Override attendance for a slot
 */
export const adminOverrideAttendance = async (
    studentIds: string[],
    slotId: string,
    date: string,
    status: AttendanceStatus,
    reason: string,
    adminId: string,
    subjectCode: string,
    subjectName: string,
    section: string,
    branch: string,
    year: string
): Promise<BulkAttendanceResponse> => {
    // First, unlock the slot for override
    if (firebaseReady && database) {
        const lockRef = ref(database, `${ATTENDANCE_PATHS.SLOT_LOCKS}/${date}/${slotId}`);
        await set(lockRef, {
            slotId,
            date,
            status: 'OVERRIDE',
            overrideBy: adminId,
            overrideReason: reason,
            overrideAt: Date.now(),
        });
    }

    // Mark attendance with override flag
    return markBulkAttendance(
        {
            studentIds,
            slotId,
            date,
            status,
            category: 'ACADEMIC',
            overrideReason: reason,
        },
        adminId,
        'ADMIN',
        subjectCode,
        subjectName,
        section,
        branch,
        year
    );
};

/**
 * Get all students for a section
 */
export const getStudentsForSection = async (
    year: string,
    branch: string,
    section: string
): Promise<AttendanceStudent[]> => {
    if (!firebaseReady || !database) {
        // Return mock students for development
        return [
            { rollNumber: '22B81A05C1', name: 'Student 1', section, branch, year },
            { rollNumber: '22B81A05C2', name: 'Student 2', section, branch, year },
            { rollNumber: '22B81A05C3', name: 'Student 3', section, branch, year },
            { rollNumber: '22B81A05C4', name: 'Student 4', section, branch, year },
            { rollNumber: '22B81A05C5', name: 'Student 5', section, branch, year },
        ];
    }

    try {
        // Fetch from Firebase Realtime Database
        const studentsRef = ref(database);
        const snapshot = await get(studentsRef);

        if (!snapshot.exists()) return [];

        const allData = snapshot.val();
        const students: AttendanceStudent[] = [];

        for (const key in allData) {
            const student = allData[key];
            if (student && student['ROLL NO']) {
                const rollNo = student['ROLL NO'];
                // Filter by section if needed
                if (rollNo.includes(section) || section === 'ALL') {
                    students.push({
                        rollNumber: rollNo,
                        name: student['Name of the student'] || student['Name'] || rollNo,
                        section,
                        branch,
                        year,
                    });
                }
            }
        }

        return students;
    } catch (error) {
        console.error('Error fetching students:', error);
        return [];
    }
};

/**
 * Calculate 4-week attendance
 */
export const calculateFourWeekAttendance = async (
    studentId: string,
    year: string,
    branch: string,
    section: string,
    category: AttendanceCategory = 'ACADEMIC'
): Promise<StudentAttendanceSummary> => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 28); // 4 weeks

    const defaultSummary: StudentAttendanceSummary = {
        studentId,
        studentName: '',
        totalClasses: 0,
        attended: 0,
        absent: 0,
        late: 0,
        excused: 0,
        percentage: 0,
        category,
        period: {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            weeks: 4,
        },
    };

    if (!firebaseReady || !database) {
        // Mock data for development
        return {
            ...defaultSummary,
            totalClasses: 48,
            attended: 40,
            absent: 5,
            late: 3,
            percentage: 83,
        };
    }

    try {
        // Fetch records for the last 4 weeks
        let totalClasses = 0;
        let attended = 0;
        let absent = 0;
        let late = 0;
        let excused = 0;

        for (let i = 0; i < 28; i++) {
            const checkDate = new Date();
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = formatDate(checkDate);

            const records = await getStudentAttendanceForDate(
                studentId,
                dateStr,
                year,
                branch,
                section
            );

            const categoryRecords = records.filter(r => r.category === category);

            for (const record of categoryRecords) {
                totalClasses++;
                switch (record.status) {
                    case 'PRESENT':
                        attended++;
                        break;
                    case 'ABSENT':
                        absent++;
                        break;
                    case 'LATE':
                        late++;
                        break;
                    case 'EXCUSED':
                        excused++;
                        break;
                }
            }
        }

        const percentage = totalClasses > 0
            ? Math.round(((attended + late * 0.5) / totalClasses) * 100)
            : 0;

        return {
            ...defaultSummary,
            totalClasses,
            attended,
            absent,
            late,
            excused,
            percentage,
        };
    } catch (error) {
        console.error('Error calculating 4-week attendance:', error);
        return defaultSummary;
    }
};

// ==================== INITIALIZATION ====================

/**
 * Initialize attendance structure in Firebase
 */
export const initializeAttendanceStructure = async (): Promise<boolean> => {
    if (!firebaseReady || !database) {
        console.log('Firebase not ready, skipping initialization');
        return false;
    }

    try {
        const configRef = ref(database, ATTENDANCE_PATHS.CONFIG);
        const snapshot = await get(configRef);

        if (!snapshot.exists()) {
            // Initialize default config
            await set(configRef, {
                lockBuffer: 15,
                timezone: 'Asia/Kolkata',
                thresholds: ATTENDANCE_THRESHOLDS,
                defaultSlots: DEFAULT_ACADEMIC_SLOTS,
                createdAt: Date.now(),
            });
        }

        return true;
    } catch (error) {
        console.error('Error initializing attendance structure:', error);
        return false;
    }
};
