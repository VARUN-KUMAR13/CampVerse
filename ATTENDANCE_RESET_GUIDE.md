# Daily Attendance Reset - Implementation Guide

## Overview
This document explains how the daily attendance reset mechanism works after 12:00 PM.

## Reset Logic Flow

```
┌─────────────────────────────────────────────────────────┐
│                   Student Dashboard                      │
│                                                          │
│  Every 60 seconds (via useEffect interval):             │
│  ├── Get current server time                            │
│  ├── Call resetDailyAttendance()                        │
│  └── Update UI                                          │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│            resetDailyAttendance() Function               │
│                                                          │
│  1. Get current server time                             │
│  2. Get today's date (YYYY-MM-DD)                       │
│  3. Get last reset date from localStorage               │
│  4. Check shouldResetAttendance()                       │
│     ├── Is it past 12:00 PM?                            │
│     └── Has reset already happened today?               │
│                                                          │
│  If YES to reset:                                       │
│  5. Scan all localStorage keys                          │
│  6. Remove all "attendance_*_{today}_*" keys            │
│  7. Update last reset date                              │
│  8. Log reset completion                                │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  UI Update (Automatic)                   │
│                                                          │
│  - All attendance statuses revert to "NOT_MARKED"       │
│  - Green/Blue backgrounds removed                        │
│  - Students see fresh slate for the day                 │
└─────────────────────────────────────────────────────────┘
```

## Time-Based Reset Conditions

### Scenario 1: Before 12:00 PM
```
Current Time: 11:30 AM
Last Reset: null or previous day
Action: No reset (normal operation)
Display: Shows any marked attendance
```

### Scenario 2: After 12:00 PM (First Time)
```
Current Time: 12:05 PM
Last Reset: null or previous day
Action: RESET TRIGGERED
Steps:
  1. Clear all today's attendance from localStorage
  2. Set last reset date to today
  3. UI shows "NOT_MARKED" for all classes
```

### Scenario 3: After 12:00 PM (Already Reset)
```
Current Time: 2:30 PM
Last Reset: Today (2026-02-02)
Action: No reset (already done today)
Display: Shows any NEW attendance marked after reset
```

### Scenario 4: Next Day Before 12:00 PM
```
Current Time: 10:00 AM (next day)
Last Reset: Previous day (2026-02-02)
Action: No reset (not past 12:00 PM yet)
Display: Shows any attendance marked in morning
```

### Scenario 5: Next Day After 12:00 PM
```
Current Time: 12:01 PM (next day)
Last Reset: Previous day (2026-02-02)
Action: RESET TRIGGERED (new day + past noon)
Steps:
  1. Clear all today's attendance
  2. Update last reset date to new date
```

## Color Coding Based on Marker Role

### Data Flow for Color Coding

```
┌─────────────────────────────────────────────────────────┐
│              Attendance Marked (Faculty/Admin)           │
│                                                          │
│  Faculty Dashboard or Admin Dashboard:                  │
│  - Faculty marks attendance                             │
│  - AttendanceRecord created with:                       │
│    {                                                     │
│      studentId: "22B81A05C3",                           │
│      status: "PRESENT",                                 │
│      markedBy: "22B81Z05C3",                            │
│      markedByRole: "FACULTY" or "ADMIN",               │
│      ...                                                 │
│    }                                                     │
│  - Saved to localStorage and Firebase                   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              Student Dashboard Reads Data                │
│                                                          │
│  1. Fetch attendance from localStorage/Firebase         │
│  2. Extract markedByRole from record                    │
│  3. Store in attendanceMarkedBy state:                  │
│     {                                                    │
│       "slot_1": "FACULTY",                              │
│       "slot_2": "ADMIN"                                 │
│     }                                                    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Apply Color Coding                     │
│                                                          │
│  For each class in schedule:                            │
│  - Check status (PRESENT/ABSENT/LATE/NOT_MARKED)        │
│  - If PRESENT:                                          │
│    ├── Check markedByRole from state                    │
│    ├── If "FACULTY" → Green background/border           │
│    └── If "ADMIN" → Blue background/border              │
│  - If ABSENT → Red background/border                    │
│  - If LATE → Yellow background/border                   │
│  - If NOT_MARKED → Gray background                      │
└─────────────────────────────────────────────────────────┘
```

## Code Examples

### Reset Function Call (Dashboard)
```typescript
// In Student Dashboard useEffect
useEffect(() => {
  const syncTime = async () => {
    const time = await getServerTime();
    setServerTime(time);
    
    // Check if we need to reset attendance (after 12:00 PM)
    await resetDailyAttendance();
  };

  syncTime();
  // Check every minute for reset
  const interval = setInterval(syncTime, 60000);
  return () => clearInterval(interval);
}, []);
```

### Color Application (Dashboard Render)
```typescript
{todaySchedule.map((item) => {
  const markedByRole = attendanceMarkedBy[item.slotId];
  let bgClass = "bg-muted/30";
  let borderClass = "";
  
  if (item.status === "PRESENT") {
    if (markedByRole === "FACULTY") {
      bgClass = "bg-green-500/10";
      borderClass = "border-l-4 border-l-green-500";
    } else if (markedByRole === "ADMIN") {
      bgClass = "bg-blue-500/10";
      borderClass = "border-l-4 border-l-blue-500";
    }
  }
  // ... render with bgClass and borderClass
})}
```

## LocalStorage Structure

### Before Reset (11:30 AM)
```
localStorage:
  attendance_last_reset_date: "2026-02-01"
  attendance_22B81A05C3_2026-02-02_slot_1: {status: "PRESENT", markedByRole: "FACULTY", ...}
  attendance_22B81A05C3_2026-02-02_slot_2: {status: "PRESENT", markedByRole: "ADMIN", ...}
```

### After Reset (12:01 PM)
```
localStorage:
  attendance_last_reset_date: "2026-02-02"
  (all attendance_*_2026-02-02_* keys removed)
```

### New Attendance After Reset (1:00 PM)
```
localStorage:
  attendance_last_reset_date: "2026-02-02"
  attendance_22B81A05C3_2026-02-02_slot_3: {status: "PRESENT", markedByRole: "FACULTY", ...}
```

## Configuration

### Reset Time Customization
To change the reset time, modify `attendanceService.ts`:

```typescript
const resetTimeInMinutes = 12 * 60; // 12:00 PM

// Examples:
// const resetTimeInMinutes = 13 * 60; // 1:00 PM
// const resetTimeInMinutes = 14 * 60 + 30; // 2:30 PM
// const resetTimeInMinutes = 0 * 60; // Midnight
```

### Check Interval Customization
To change how often reset is checked, modify Dashboard:

```typescript
const interval = setInterval(syncTime, 60000); // 60000ms = 1 minute

// Examples:
// const interval = setInterval(syncTime, 30000); // 30 seconds
// const interval = setInterval(syncTime, 120000); // 2 minutes
```

## Important Notes

1. **LocalStorage Only**: Currently resets only affect localStorage. Firebase data is preserved.

2. **Per-Student**: Reset affects only the logged-in student's view, not the entire system.

3. **Historical Data**: Past dates' attendance is NOT affected by the reset.

4. **Real-time Sync**: After reset, if faculty/admin marks new attendance, it will appear immediately.

5. **Role Tracking**: The `markedByRole` field is crucial for color coding. Ensure all attendance marking functions include this field.

## Troubleshooting

### Issue: Attendance not resetting
- Check browser console for "[resetDailyAttendance]" logs
- Verify system time is past 12:00 PM
- Check attendance_last_reset_date in localStorage

### Issue: Wrong colors displayed
- Verify markedByRole is saved in attendance records
- Check attendanceMarkedBy state in React DevTools
- Ensure Faculty uses role "FACULTY" and Admin uses "ADMIN"

### Issue: Reset happening too frequently
- Check if multiple intervals are running
- Verify last reset date is being properly saved
- Check for multiple Dashboard components mounting
