import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '@/lib/api';

// Event interface
export interface Event {
    _id: string;
    event_id: string;
    title: string;
    description: string;
    category: 'Technical' | 'Cultural' | 'Sports' | 'Workshop' | 'Seminar' | 'Competition' | 'Other';
    date: string;
    endDate?: string;
    venue: string;
    organizer: string;
    entryFee: string;
    maxParticipants: number;
    registeredParticipants: number;
    status: 'Open' | 'Closed' | 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
    featured: boolean;
    highlights: string[];
    prizes?: string;
    registrationDeadline?: string;
    targetAudience?: string;
    eligibleBranches?: string[];
    contactEmail?: string;
    contactPhone?: string;
    websiteLink?: string;
    posterImage?: string;
    registrationLink?: string;
    attachments?: { filename: string; url: string }[];
    postedBy?: { name: string; collegeId: string };
    isRegistrationOpen?: boolean;
    createdAt?: string;
}

interface EventContextType {
    events: Event[];
    loading: boolean;
    error: string | null;
    fetchEvents: () => Promise<void>;
    addEvent: (event: Omit<Event, '_id' | 'registeredParticipants' | 'createdAt' | 'postedBy'>) => Promise<void>;
    updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
    deleteEvent: (eventId: string) => Promise<void>;
    registerForEvent: (eventId: string) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const useEvents = () => {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error('useEvents must be used within an EventProvider');
    }
    return context;
};

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all events from MongoDB
    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching events from MongoDB...');

            const response = await api.get('/events');
            console.log('Events response:', response);

            if (response.events) {
                setEvents(response.events);
            } else if (Array.isArray(response)) {
                setEvents(response);
            }
        } catch (err: any) {
            console.error('Error fetching events:', err);
            setError(err.message || 'Failed to fetch events');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch events when user logs in
    useEffect(() => {
        if (currentUser) {
            fetchEvents();
        }
    }, [currentUser, fetchEvents]);

    // Add a new event
    const addEvent = async (eventData: Omit<Event, '_id' | 'registeredParticipants' | 'createdAt' | 'postedBy'>) => {
        try {
            setError(null);
            console.log('Adding new event:', eventData);

            const response = await api.post('/events', eventData);
            console.log('Event created:', response);

            // Refresh events list
            await fetchEvents();
        } catch (err: any) {
            console.error('Error adding event:', err);
            setError(err.message || 'Failed to add event');
            throw err;
        }
    };

    // Update an event
    const updateEvent = async (eventId: string, updates: Partial<Event>) => {
        try {
            setError(null);
            const response = await api.put(`/events/${eventId}`, updates);
            console.log('Event updated:', response);
            await fetchEvents();
        } catch (err: any) {
            console.error('Error updating event:', err);
            setError(err.message || 'Failed to update event');
            throw err;
        }
    };

    // Delete an event
    const deleteEvent = async (eventId: string) => {
        try {
            setError(null);
            await api.delete(`/events/${eventId}`);
            console.log('Event deleted:', eventId);
            await fetchEvents();
        } catch (err: any) {
            console.error('Error deleting event:', err);
            setError(err.message || 'Failed to delete event');
            throw err;
        }
    };

    // Register for an event
    const registerForEvent = async (eventId: string) => {
        try {
            setError(null);
            const response = await api.post(`/events/${eventId}/register`, {});
            console.log('Registered for event:', response);
            await fetchEvents();
        } catch (err: any) {
            console.error('Error registering for event:', err);
            setError(err.message || 'Failed to register for event');
            throw err;
        }
    };

    const value = {
        events,
        loading,
        error,
        fetchEvents,
        addEvent,
        updateEvent,
        deleteEvent,
        registerForEvent,
    };

    return (
        <EventContext.Provider value={value}>
            {children}
        </EventContext.Provider>
    );
};

export default EventContext;
