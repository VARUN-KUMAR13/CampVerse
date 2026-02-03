# Attendance Daily Reset & Color Coding Feature

## Overview
This document describes the implementation of two key features for the CampVerse attendance system:
1. **Daily Reset**: Automatically reset all attendance to "NOT_MARKED" after 12:00 PM each day
2. **Color Coding**: Display different background colors based on who marked the attendance

## Features Implemented

### 1. Daily Attendance Reset (After 12:00 PM)

The system now automatically resets attendance daily after 12:00 PM (noon). This ensures that:
- Each day starts fresh at 12:00 PM
- Previous day's attendance is cleared from display
- Students see "NOT_MARKED" status for all classes after the reset time

**Implementation Details:**
- Location: `src/services/attendanceService.ts`
- Functions Added:
  - `shouldResetAttendance()`: Checks if reset is needed based on current time
  - `getLastResetDate()`: Retrieves last reset date from localStorage
  - `setLastResetDate()`: Stores reset date in localStorage
  - `resetDailyAttendance()`: Main function that clears attendance after 12:00 PM

**How It Works:**
1. Every minute, the system checks the current time
2. If it's past 12:00 PM and attendance hasn't been reset for today, it triggers a reset
3. All attendance records for the current day in localStorage are cleared
4. The last reset date is updated to prevent duplicate resets

### 2. Color-Coded Attendance Display

The attendance display now shows different colors based on who marked the attendance:

#### Color Scheme:
- **Green Background** 🟢: Attendance marked by Faculty
  - Background: `bg-green-500/10`
  - Border: `border-l-4 border-l-green-500`
  - Badge: Green color scheme

- **Blue Background** 🔵: Attendance marked by Admin
  - Background: `bg-blue-500/10`
  - Border: `border-l-4 border-l-blue-500`
  - Badge: Blue color scheme

- **Red Background** 🔴: Absent status
  - Background: `bg-red-500/10`
  - Border: `border-l-4 border-l-red-500`

- **Yellow Background** 🟡: Late status
  - Background: `bg-yellow-500/10`
  - Border: `border-l-4 border-l-yellow-500`

**Implementation Details:**
- Location: `src/pages/student/Dashboard.tsx`
- Changes Made:
  - Added `attendanceMarkedBy` state to track who marked each slot
  - Modified `getStatusBadge()` to accept `markedByRole` parameter
  - Updated attendance display logic to apply different colors based on `markedByRole`
  - Enhanced localStorage and Firebase subscription to capture `markedByRole` from attendance records

## Modified Files

1. **`src/services/attendanceService.ts`**
   - Added daily reset functions
   - Export: `resetDailyAttendance`, `shouldResetAttendance`, `getLastResetDate`, `setLastResetDate`

2. **`src/pages/student/Dashboard.tsx`**
   - Integrated daily reset check in time sync effect
   - Added color coding logic based on `markedByRole`
   - Track attendance marker role in state

3. **`src/types/attendance.ts`**
   - Added `markedByRole?: AttendanceRole` to `DailyScheduleItem` interface

## How to Use

### For Students:
- View your attendance on the dashboard
- Green background = Marked by your faculty
- Blue background = Marked by admin
- Attendance automatically resets to "NOT_MARKED" after 12:00 PM daily

### For Faculty:
- Mark attendance normally
- Students will see green background for your markings

### For Admin:
- Mark attendance normally
- Students will see blue background for your markings

## Technical Details

### Reset Time Configuration
The reset time is currently hardcoded to **12:00 PM (noon)**.
- Location: `attendanceService.ts`, line with `const resetTimeInMinutes = 12 * 60;`
- To change: Modify the value (e.g., `13 * 60` for 1:00 PM)

### LocalStorage Keys
- Reset tracking: `attendance_last_reset_date`
- Attendance records: `attendance_{studentId}_{date}_{slotId}`

### Color Customization
Colors are defined in the Dashboard component and use Tailwind CSS classes:
```typescript
// Faculty (Green)
bgClass = "bg-green-500/10 hover:bg-green-500/15";
borderClass = "border-l-4 border-l-green-500";

// Admin (Blue)
bgClass = "bg-blue-500/10 hover:bg-blue-500/15";
borderClass = "border-l-4 border-l-blue-500";
```

## Testing

To test the features:

1. **Daily Reset Testing:**
   - Set your system time to before 12:00 PM
   - Mark some attendance
   - Change system time to after 12:00 PM
   - Wait 1 minute or refresh the page
   - Attendance should reset to "NOT_MARKED"

2. **Color Coding Testing:**
   - Have faculty mark attendance for a student
   - Student should see green background
   - Have admin mark attendance for a student
   - Student should see blue background

## Notes

- The reset only affects the current day's attendance
- Historical attendance data is preserved
- Colors are visible only when attendance status is "PRESENT"
- The system checks for reset every minute (can be adjusted if needed)
