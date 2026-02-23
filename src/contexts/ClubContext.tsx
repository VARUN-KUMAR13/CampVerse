import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '@/lib/api';

// Club interface
export interface Club {
    _id: string;
    club_id: string;
    name: string;
    description: string;
    category: 'Technical' | 'Cultural' | 'Sports' | 'Literary' | 'Social' | 'Professional' | 'Hobby' | 'Other';
    foundedYear?: number;
    logo?: string;
    coverImage?: string;
    president?: {
        name: string;
        email: string;
        phone: string;
    };
    faculty_advisor?: {
        name: string;
        email: string;
        department: string;
    };
    memberCount: number;
    joinedStudents?: string[];
    maxMembers: number;
    meetingSchedule?: string;
    venue?: string;
    achievements?: string[];
    upcomingEvents?: {
        title: string;
        date: string;
        description: string;
    }[];
    socialLinks?: {
        instagram?: string;
        linkedin?: string;
        twitter?: string;
        website?: string;
    };
    recruitmentStatus: 'Open' | 'Closed' | 'Coming Soon';
    recruitmentDeadline?: string;
    eligibility: string;
    membershipFee: string;
    tags?: string[];
    featured: boolean;
    status: 'Active' | 'Inactive' | 'On Hold';
    postedBy?: { name: string; collegeId: string };
    isRecruitmentOpen?: boolean;
    createdAt?: string;
}

interface ClubContextType {
    clubs: Club[];
    loading: boolean;
    error: string | null;
    fetchClubs: () => Promise<void>;
    addClub: (club: Omit<Club, '_id' | 'memberCount' | 'createdAt' | 'postedBy'>) => Promise<void>;
    updateClub: (clubId: string, updates: Partial<Club>) => Promise<void>;
    deleteClub: (clubId: string) => Promise<void>;
    joinClub: (clubId: string) => Promise<void>;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export const useClubs = () => {
    const context = useContext(ClubContext);
    if (!context) {
        throw new Error('useClubs must be used within a ClubProvider');
    }
    return context;
};

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all clubs from MongoDB
    const fetchClubs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching clubs from MongoDB...');

            const response = await api.get('/clubs');
            console.log('Clubs response:', response);

            if (response.clubs) {
                setClubs(response.clubs);
            } else if (Array.isArray(response)) {
                setClubs(response);
            }
        } catch (err: any) {
            console.error('Error fetching clubs:', err);
            setError(err.message || 'Failed to fetch clubs');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch clubs when user logs in
    useEffect(() => {
        if (currentUser) {
            fetchClubs();
        }
    }, [currentUser, fetchClubs]);

    // Add a new club
    const addClub = async (clubData: Omit<Club, '_id' | 'memberCount' | 'createdAt' | 'postedBy'>) => {
        try {
            setError(null);
            console.log('Adding new club:', clubData);

            const response = await api.post('/clubs', clubData);
            console.log('Club created:', response);

            // Refresh clubs list
            await fetchClubs();
        } catch (err: any) {
            console.error('Error adding club:', err);
            setError(err.message || 'Failed to add club');
            throw err;
        }
    };

    // Update a club
    const updateClub = async (clubId: string, updates: Partial<Club>) => {
        try {
            setError(null);
            const response = await api.put(`/clubs/${clubId}`, updates);
            console.log('Club updated:', response);
            await fetchClubs();
        } catch (err: any) {
            console.error('Error updating club:', err);
            setError(err.message || 'Failed to update club');
            throw err;
        }
    };

    // Delete a club
    const deleteClub = async (clubId: string) => {
        try {
            setError(null);
            await api.delete(`/clubs/${clubId}`);
            console.log('Club deleted:', clubId);
            await fetchClubs();
        } catch (err: any) {
            console.error('Error deleting club:', err);
            setError(err.message || 'Failed to delete club');
            throw err;
        }
    };

    // Join a club
    const joinClub = async (clubId: string) => {
        try {
            setError(null);
            const response = await api.post(`/clubs/${clubId}/join`, {});
            console.log('Joined club:', response);
            await fetchClubs();
        } catch (err: any) {
            console.error('Error joining club:', err);
            setError(err.message || 'Failed to join club');
            throw err;
        }
    };

    const value = {
        clubs,
        loading,
        error,
        fetchClubs,
        addClub,
        updateClub,
        deleteClub,
        joinClub,
    };

    return (
        <ClubContext.Provider value={value}>
            {children}
        </ClubContext.Provider>
    );
};

export default ClubContext;
