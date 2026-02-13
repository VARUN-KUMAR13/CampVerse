# Schedule Management System - Implementation Plan

## Overview
This document outlines the future implementation of a **Schedule Management System** that will replace the current "Post Upcoming Exam" feature with a comprehensive "Schedule" feature. This system will allow admins to post events (holidays, exams, timetable changes) that will dynamically update the Academic Calendar and Today's Schedule & Attendance sections.

---

## Current State Analysis

### Existing Components:
1. **Admin Dashboard**: Has "Post Upcoming Exam" action card
2. **Student Dashboard**: 
   - `upcomingEvents` array (hardcoded) - Academic Calendar data
   - `todaySchedule` array - Today's Schedule & Attendance
3. **Admin Exams Page**: Contains "Post Upcoming Exam" functionality

### Data Currently Hardcoded (to be made dynamic):
```typescript
// Student Dashboard - lines 639-676
const upcomingEvents = [
  { date: "16.06.2025", title: "Commencement of Classwork", timeLeft: "Starts", color: "bg-green-500" },
  { date: "07.09.2025 to 17.09.2025", title: "I Mid Examinations", timeLeft: "1 Week", color: "bg-blue-500" },
  { date: "22.10.2025 to 25.10.2025", title: "II Mid Examinations", timeLeft: "4 Days", color: "bg-purple-500" },
  // ... duplicate dates found: "03.11.2025 to 17.11.2025" appears twice
];
```

---

## Feature Requirements

### 1. Schedule Types to Support
| Type | Description | Color Code |
|------|-------------|------------|
| `EXAM` | Mid/End Semester Exams | Blue/Purple |
| `HOLIDAY` | Public Holidays, Vacation | Yellow/Orange |
| `EVENT` | College Events, Fests | Green |
| `TIMETABLE_CHANGE` | Class rescheduling, room changes | Red |
| `PRACTICAL` | Lab exams, practical assessments | Indigo |

### 2. Admin Features
- **Post Schedule**: Create new events with date range, type, description
- **Edit Schedule**: Modify existing events
- **Delete Schedule**: Remove events
- **Conflict Detection**: Warn when overlapping events exist

### 3. Student Dashboard Updates
- **Academic Calendar**: Dynamically fetch from Firebase
- **Today's Schedule**: Update based on timetable changes
- **Notifications**: Alert for schedule changes

---

## Database Schema (Firebase)

### Collection: `schedules`
```typescript
interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  type: 'EXAM' | 'HOLIDAY' | 'EVENT' | 'TIMETABLE_CHANGE' | 'PRACTICAL';
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  color: string;     // Tailwind color class
  affectedSections?: string[]; // ['A', 'B', 'C'] or ['ALL']
  affectedBranches?: string[]; // ['CSE', 'ECE'] or ['ALL']
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}
```

### Firebase Path Structure
```
/schedules
  /academic_year_2025_26
    /event_id_1: { ...ScheduleEvent }
    /event_id_2: { ...ScheduleEvent }
```

### Collection: `timetable_overrides`
```typescript
interface TimetableOverride {
  id: string;
  date: string;           // Specific date of override
  originalSlotId: string; // Original schedule slot
  newSubjectCode?: string;
  newSubjectName?: string;
  newTime?: string;
  isCancelled: boolean;   // If class is cancelled
  reason: string;
  createdBy: string;
  createdAt: number;
}
```

---

## Implementation Phases

### Phase 1: Backend & Data Model
1. Create Firebase collection structure for schedules
2. Create TypeScript interfaces in `src/types/schedule.ts`
3. Create service file `src/services/scheduleService.ts`
   - `createScheduleEvent()`
   - `getScheduleEvents(startDate, endDate)`
   - `updateScheduleEvent()`
   - `deleteScheduleEvent()`
   - `subscribeToScheduleEvents()` (real-time)

### Phase 2: Admin Interface
1. Rename "Post Upcoming Exam" to "Schedule Management"
2. Create new page: `src/pages/admin/Schedule.tsx`
   - Form to add/edit events
   - Calendar view showing all events
   - Conflict detection UI
3. Update admin dashboard action cards

### Phase 3: Student Dashboard Integration
1. Replace hardcoded `upcomingEvents` with Firebase data
2. Add real-time subscription to schedule changes
3. Calculate `timeLeft` dynamically based on current date
4. Auto-assign colors based on event type
5. Sort and deduplicate events

### Phase 4: Timetable Integration
1. Create timetable override system
2. Modify `todaySchedule` to check for overrides
3. Show visual indicator for modified classes
4. Push notifications for schedule changes

---

## Code Changes Required

### Files to Create:
- `src/types/schedule.ts` - TypeScript interfaces
- `src/services/scheduleService.ts` - Firebase CRUD operations
- `src/pages/admin/Schedule.tsx` - Admin schedule management page

### Files to Modify:
- `src/pages/admin/Dashboard.tsx` - Update action card
- `src/pages/student/Dashboard.tsx` - Dynamic Academic Calendar
- `src/App.tsx` - Add route for admin Schedule page

---

## Sample Implementation

### scheduleService.ts (Preview)
```typescript
import { database } from '@/lib/firebase';
import { ref, get, set, push, onValue, off } from 'firebase/database';

export const SCHEDULE_PATHS = {
  EVENTS: 'schedules/events',
  OVERRIDES: 'schedules/timetable_overrides',
};

export const getScheduleEvents = async (
  startDate: Date,
  endDate: Date
): Promise<ScheduleEvent[]> => {
  const eventsRef = ref(database, SCHEDULE_PATHS.EVENTS);
  const snapshot = await get(eventsRef);
  
  if (!snapshot.exists()) return [];
  
  const events = Object.values(snapshot.val()) as ScheduleEvent[];
  
  // Filter by date range and sort by start date
  return events
    .filter(e => e.isActive && isWithinRange(e, startDate, endDate))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
};

export const subscribeToScheduleEvents = (
  callback: (events: ScheduleEvent[]) => void
): (() => void) => {
  const eventsRef = ref(database, SCHEDULE_PATHS.EVENTS);
  
  const unsubscribe = onValue(eventsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const events = Object.values(snapshot.val()) as ScheduleEvent[];
    callback(events.filter(e => e.isActive));
  });
  
  return () => off(eventsRef);
};
```

### Student Dashboard Update (Preview)
```typescript
// Replace hardcoded upcomingEvents with dynamic data
const [academicEvents, setAcademicEvents] = useState<ScheduleEvent[]>([]);

useEffect(() => {
  const unsubscribe = subscribeToScheduleEvents((events) => {
    // Calculate timeLeft for each event
    const eventsWithTimeLeft = events.map(event => ({
      ...event,
      timeLeft: calculateTimeLeft(event.startDate),
    }));
    setAcademicEvents(eventsWithTimeLeft);
  });
  
  return () => unsubscribe();
}, []);
```

---

## Timeline Estimate
| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1 | 2-3 days | High |
| Phase 2 | 3-4 days | High |
| Phase 3 | 2-3 days | Medium |
| Phase 4 | 3-4 days | Medium |

**Total: ~2 weeks**

---

## Notes
- Remove duplicate entries in current Academic Calendar (same dates for different events)
- Implement proper date range handling for multi-day events
- Add admin notifications for new schedule posts
- Consider adding iCal export for students to sync with personal calendars
