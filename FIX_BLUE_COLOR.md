# Quick Fix for Blue Color Not Showing

## Problem
Admin-marked attendance showing GREEN instead of BLUE.

## Root Cause
The attendance record in localStorage has:
- `markedByRole: "FACULTY"` (wrong)
- OR missing `markedByRole` field

## Solution Options

### Option 1: Clear and Re-mark (Recommended)
```javascript
// 1. Open browser console (F12)
// 2. Clear attendance data:
localStorage.clear();

// 3. Refresh the page
location.reload();

// 4. Re-mark attendance as admin
// Now it will save with markedByRole: "ADMIN"
```

### Option 2: Manually Fix Specific Record
```javascript
// 1. Open browser console (F12)
// 2. Find the problem key (e.g., for Business Economics, slot_2):

const studentId = "22B81A05B1"; // Replace with actual student ID
const today = "2026-02-02"; // Today's date
const slotId = "slot_2"; // The slot for Business Economics

const key = `attendance_${studentId}_${today}_${slotId}`;
const record = JSON.parse(localStorage.getItem(key));

// 3. Update the markedByRole:
record.markedByRole = "ADMIN";
record.markedBy = "admin";

// 4. Save it back:
localStorage.setItem(key, JSON.stringify(record));

// 5. Refresh:
location.reload();
```

### Option 3: Auto-Fix Script
```javascript
// Paste this in browser console to auto-fix all records

const today = new Date().toISOString().split('T')[0];

for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.includes('attendance') && key.includes(today)) {
    try {
      const record = JSON.parse(localStorage.getItem(key));
      
      // If marked by admin but role is wrong
      if (record.markedBy === 'admin' || record.markedBy?.includes('admin')) {
        record.markedByRole = 'ADMIN';
        localStorage.setItem(key, JSON.stringify(record));
        console.log(`Fixed: ${key}`);
      }
    } catch (e) {}
  }
}

console.log("Done! Refresh the page.");
location.reload();
```

## Step-by-Step Instructions

1. **Open Student Dashboard** where you see green instead of blue

2. **Press F12** to open Developer Console

3. **Click "Console" tab**

4. **Choose a solution** (Option 1 is easiest):

   ```javascript
   // Quick clear and restart
   localStorage.clear();
   location.reload();
   ```

5. **Login again as Admin**

6. **Mark the attendance** for Business Economics

7. **Login as Student** and check - should now be BLUE!

## Verification

After fixing, check the console logs:
```
[Attendance] Found in localStorage: slot_2 = PRESENT, markedBy: ADMIN ✅
```

Should say "ADMIN" not "FACULTY"

## Prevention

For future:
- Always use Admin dashboard to mark attendance as admin
- System will automatically set `markedByRole: "ADMIN"`
- Blue color will appear automatically

## Visual Confirmation

After fix, you should see:
- **Background**: Blue tint (bg-blue-500/20)
- **Left Border**: Blue 4px thick
- **Badge**: Blue "Present"
- **Entire card**: Clear blue theme

## Still Not Working?

If still showing green after fix:

1. Check console logs - what does it say for markedByRole?
2. Try hard refresh: Ctrl + Shift + R
3. Clear browser cache completely
4. Re-mark attendance using admin account

## Contact Info

If problem persists, check:
- Browser console for errors
- localStorage contents using debug script
- Verify admin login is using role "admin"
