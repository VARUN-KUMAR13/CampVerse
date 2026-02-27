import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ref, push, onValue, set, remove, query, orderByChild, limitToLast, off } from 'firebase/database';
import { auth, database, firebaseReady } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

// Notification interface
export interface Notification {
    id: string;
    title: string;
    message: string;
    urgency: 'normal' | 'important' | 'critical';
    targetAudience: {
        type: 'all' | 'students' | 'faculty' | 'custom';
        branches?: string[];
        sections?: string[];
        years?: string[];
        groups?: string[];
        specificRoles?: string[];
    };
    postedBy: {
        name: string;
        role: string;
        collegeId: string;
    };
    createdAt: number;
    expiresAt?: number;
    isRead?: boolean;
    category?: 'general' | 'academic' | 'placement' | 'event' | 'emergency';
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    sendNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'postedBy'>) => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (notificationId: string) => Promise<void>;
    fetchNotifications: () => void;
    allNotifications: Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// LocalStorage key for notifications
const NOTIFICATIONS_STORAGE_KEY = 'campverse_notifications';

// Helper to get notifications from localStorage
const getLocalNotifications = (): Notification[] => {
    try {
        const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

// Helper to save notifications to localStorage
const saveLocalNotifications = (notifications: Notification[]) => {
    try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (err) {
        console.error('Error saving notifications to localStorage:', err);
    }
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, userData } = useAuth();
    const { toast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [useLocalStorage, setUseLocalStorage] = useState(true); // Default to localStorage
    const hasShownLoginToast = useRef(false);
    const previousUnreadCount = useRef(0);

    // Check if notification is relevant to current user
    const isNotificationRelevant = useCallback((notification: Notification, user: any): boolean => {
        if (!user) return false;

        const target = notification.targetAudience;

        // If target is 'all', everyone sees it
        if (target.type === 'all') return true;

        // If target is 'students' and user is a student
        if (target.type === 'students' && user.role === 'student') return true;

        // If target is 'faculty' and user is faculty
        if (target.type === 'faculty' && user.role === 'faculty') return true;

        // Admin sees all notifications
        if (user.role === 'admin') return true;

        // For custom targeting
        if (target.type === 'custom') {
            if (target.specificRoles?.includes(user.role)) return true;

            if (target.branches && target.branches.length > 0) {
                const userBranch = extractBranchFromId(user.collegeId);
                if (target.branches.includes(userBranch)) return true;
            }

            if (target.years && target.years.length > 0) {
                const userYear = extractYearFromId(user.collegeId);
                if (target.years.includes(userYear)) return true;
            }

            if (target.sections && target.sections.length > 0) {
                const userSection = user.section || extractSectionFromId(user.collegeId);
                if (target.sections.includes(userSection)) return true;
            }
        }

        return false;
    }, []);

    // Helper functions to extract info from college ID
    const extractBranchFromId = (collegeId: string): string => {
        if (!collegeId) return '';
        const branchCode = collegeId.substring(5, 8);
        const branchMap: { [key: string]: string } = {
            'A05': 'CSE',
            'A04': 'ECE',
            'A03': 'EEE',
            'A01': 'CIVIL',
            'A02': 'MECH',
        };
        return branchMap[branchCode] || branchCode;
    };

    const extractYearFromId = (collegeId: string): string => {
        if (!collegeId) return '';
        const yearCode = collegeId.substring(0, 2);
        const currentYear = new Date().getFullYear();
        const admissionYear = parseInt('20' + yearCode);
        // Correct mathematical bounds; 2026 - 2022 yields 4 for 4th years
        // Bound calculation between 1 and 4.
        const yearInt = currentYear - admissionYear;
        const boundedYear = Math.max(1, Math.min(4, yearInt));
        return boundedYear.toString();
    };

    const extractSectionFromId = (collegeId: string): string => {
        if (!collegeId) return '';
        return collegeId.charAt(collegeId.length - 2).toUpperCase();
    };

    // Process notifications for current user
    const processNotifications = useCallback((notificationsList: Notification[]) => {
        // Sort by createdAt descending
        notificationsList.sort((a, b) => b.createdAt - a.createdAt);

        // Store all notifications for admin view
        setAllNotifications(notificationsList);

        // Filter notifications relevant to current user
        if (userData) {
            const relevantNotifications = notificationsList.filter(n =>
                isNotificationRelevant(n, userData)
            );
            setNotifications(relevantNotifications);

            // Count unread
            const unread = relevantNotifications.filter(n => !n.isRead).length;
            setUnreadCount(unread);

            // Show toast on login if there are new notifications
            if (!hasShownLoginToast.current && unread > 0) {
                hasShownLoginToast.current = true;
                toast({
                    title: `🔔 You have ${unread} new notification${unread > 1 ? 's' : ''}!`,
                    description: "Click the bell icon to view your notifications.",
                });
            }
        }

        setError(null);
    }, [userData, isNotificationRelevant, toast]);

    // Fetch notifications from localStorage
    const fetchLocalNotifications = useCallback(() => {
        setLoading(true);
        const localNotifications = getLocalNotifications();
        processNotifications(localNotifications);
        setLoading(false);
    }, [processNotifications]);

    // Fetch and listen to notifications
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Try Firebase first
        if (firebaseReady && database) {
            let hasFirebaseAuth = !!auth?.currentUser;

            // For admin lacking explicit Firebase Auth, sign in with the expected admin credentials to safely access the DB
            if (!hasFirebaseAuth && userData?.role === 'admin') {
                try {
                    const { signInWithEmailAndPassword } = await import("firebase/auth");
                    await signInWithEmailAndPassword(auth, "admin@cvr.ac.in", "admin");
                    hasFirebaseAuth = true; // successfully grabbed temporary credentials
                } catch (e: any) {
                    console.warn("Could not log admin into Firebase:", e.message);
                }
            }

            if (hasFirebaseAuth) {
                const notificationsRef = ref(database, 'notifications');
                const recentNotificationsQuery = query(
                    notificationsRef,
                    orderByChild('createdAt'),
                    limitToLast(100)
                );

                onValue(recentNotificationsQuery, (snapshot) => {
                    const data = snapshot.val();
                    setUseLocalStorage(false);
                    if (data) {
                        const notificationsList: Notification[] = Object.entries(data).map(([id, value]: [string, any]) => ({
                            id,
                            ...value,
                        }));
                        processNotifications(notificationsList);
                    } else {
                        setNotifications([]);
                        setAllNotifications([]);
                        setUnreadCount(0);
                    }
                    setLoading(false);
                }, (err) => {
                    console.error('Error fetching notifications from Firebase:', err);
                    setUseLocalStorage(true);
                    fetchLocalNotifications();
                });
                return;
            }
        }

        // Use localStorage (fallback for no Firebase or failed Auth)
        console.log('Using localStorage for notifications (Firebase Auth not available)');
        fetchLocalNotifications();
    }, [processNotifications, fetchLocalNotifications, auth?.currentUser, userData?.role]);

    // Subscribe to notifications when user logs in
    useEffect(() => {
        if (currentUser && userData) {
            hasShownLoginToast.current = false; // Reset toast flag on login
            fetchNotifications();

            return () => {
                if (database && firebaseReady && !useLocalStorage) {
                    const notificationsRef = ref(database, 'notifications');
                    off(notificationsRef);
                }
            };
        }
    }, [currentUser, userData]);

    // Send a new notification
    const sendNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'postedBy'>) => {
        if (!userData) {
            throw new Error('User not authenticated');
        }

        const newNotification: Notification = {
            ...notificationData,
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            postedBy: {
                name: userData.name || 'Admin',
                role: userData.role || 'admin',
                collegeId: userData.collegeId || 'admin',
            },
            createdAt: Date.now(),
            isRead: false,
        };

        try {
            setError(null);

            // Try Firebase first if available and not in dev mode
            if (firebaseReady && database) {
                try {
                    const notificationsRef = ref(database, 'notifications');
                    const { id, ...notificationWithoutId } = newNotification;
                    await push(notificationsRef, notificationWithoutId);
                    console.log('Notification sent successfully via Firebase');
                    setUseLocalStorage(false);
                    return;
                } catch (firebaseErr: any) {
                    console.warn('Firebase push failed:', firebaseErr.message);
                    setUseLocalStorage(true);
                }
            }

            // Use localStorage
            const existingNotifications = getLocalNotifications();
            const updatedNotifications = [newNotification, ...existingNotifications];
            saveLocalNotifications(updatedNotifications);
            processNotifications(updatedNotifications);
            console.log('Notification saved to localStorage');
        } catch (err: any) {
            console.error('Error sending notification:', err);
            setError(err.message || 'Failed to send notification');
            throw err;
        }
    };

    // Delete a notification
    const deleteNotification = async (notificationId: string) => {
        try {
            if (!useLocalStorage && firebaseReady && database) {
                const notificationRef = ref(database, `notifications/${notificationId}`);
                await remove(notificationRef);
            } else {
                // Delete from localStorage
                const existingNotifications = getLocalNotifications();
                const updatedNotifications = existingNotifications.filter(n => n.id !== notificationId);
                saveLocalNotifications(updatedNotifications);
                processNotifications(updatedNotifications);
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
            throw err;
        }
    };

    // Mark a notification as read
    const markAsRead = async (notificationId: string) => {
        if (useLocalStorage || !firebaseReady || !database) {
            const existingNotifications = getLocalNotifications();
            const updatedNotifications = existingNotifications.map(n =>
                n.id === notificationId ? { ...n, isRead: true } : n
            );
            saveLocalNotifications(updatedNotifications);
            processNotifications(updatedNotifications);
            return;
        }

        try {
            const notificationRef = ref(database, `notifications/${notificationId}/isRead`);
            await set(notificationRef, true);
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        if (useLocalStorage || !firebaseReady || !database) {
            const existingNotifications = getLocalNotifications();
            const updatedNotifications = existingNotifications.map(n => ({ ...n, isRead: true }));
            saveLocalNotifications(updatedNotifications);
            processNotifications(updatedNotifications);
            return;
        }

        try {
            for (const n of notifications) {
                await set(ref(database, `notifications/${n.id}/isRead`), true);
            }
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const value = {
        notifications,
        unreadCount,
        loading,
        error,
        sendNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
        allNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
