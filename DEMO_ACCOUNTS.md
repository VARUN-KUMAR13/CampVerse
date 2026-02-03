# CampVerse Demo Accounts Configuration

## Project Scope
- **Branch**: CSE (Computer Science Engineering)
- **Section**: B
- **Student Roll Numbers**: 22B81A0565 to 22B81A05C8
- **Total Students**: ~99 students

---

## Demo Login Credentials

### 👨‍💼 Admin Account
```
College ID: admin
Password: admin123 (or your configured admin password)
Role: ADMIN
```

**Admin Capabilities:**
- Mark attendance for any class (appears as BLUE on student dashboard)
- Override attendance at any time
- View all students' attendance
- Manage all sections and branches
- No time restrictions

---

### 👨‍🏫 Faculty Account
```
College ID: 22B81Z05B1
Password: (set your faculty password)
Role: FACULTY
Name: Dr. Faculty Demo
Section: B
Branch: CSE (05)
```

**Faculty Capabilities:**
- Mark attendance for Section B students only (appears as GREEN on student dashboard)
- Time-bound marking (can be bypassed in development mode)
- View only Section B students
- Mark ACADEMIC attendance only

**Alternative Faculty ID Format:**
```
College ID: faculty_cseb or 22B81Z05B1
Password: faculty123
```

---

### 👨‍🎓 Student Accounts (CSE Section-B)

**Test Student 1:**
```
College ID: 22B81A0565
Password: (set student password)
Section: B
Branch: CSE (05)
```

**Test Student 2:**
```
College ID: 22B81A05C8
Password: (set student password)
Section: B
Branch: CSE (05)
```

**Any Student in Range:**
```
Roll Numbers: 22B81A0565 to 22B81A05C8
Format: 22B81A05[65-C8 in hex]
Section: B (character at position 5 is 'B')
Branch: 05 (CSE)
Year: 22
```

---

## Quick Demo Flow

### For Project Presentation:

#### 🎯 **Step 1: Login as Faculty**
1. Login with: `22B81Z05B1` / `faculty123`
2. Go to Attendance Marking
3. Mark attendance for some students (select PRESENT/ABSENT)
4. Students marked will show **GREEN** background

#### 🎯 **Step 2: Login as Admin**
1. Logout and login with: `admin` / `admin123`
2. Go to Admin Attendance Dashboard
3. Mark attendance for different students or override existing
4. Students marked by admin show **BLUE** background

#### 🎯 **Step 3: Login as Student**
1. Logout and login with: `22B81A0565` or any student ID
2. View Student Dashboard
3. See attendance with color coding:
   - Green = Marked by Faculty
   - Blue = Marked by Admin
   - Red = Absent
   - Gray = Not Marked

#### 🎯 **Step 4: Show Daily Reset**
1. While logged in as student, check current time
2. If before 12:00 PM, mark some attendance
3. Wait until after 12:00 PM (or manually change system time for demo)
4. Within 1 minute, all attendance resets to "Not Marked"

---

## Firebase Data Structure

### Students Data Path:
```
Firebase Realtime Database:
/
  ├── 22B81A0565/
  │   ├── ROLL NO: "22B81A0565"
  │   ├── Name of the student: "Student Name"
  │   ├── Section: "B"
  │   └── Branch: "CSE"
  ├── 22B81A0566/
  ├── ...
  └── 22B81A05C8/
```

### Attendance Data Path:
```
attendance/
  └── records/
      └── 22/              (year)
          └── 05/          (branch - CSE)
              └── B/       (section)
                  └── 2026-02-02/    (date)
                      ├── 22B81A0565_2026-02-02_slot_1
                      ├── 22B81A0565_2026-02-02_slot_2
                      └── ...
```

---

## Recommended Configuration

### For Easy Demo:

1. **Keep Admin Simple:**
   - ID: `admin`
   - No need for roll number format
   - Universal access

2. **Faculty with Section B Access:**
   - ID: `22B81Z05B1` (Z = Faculty indicator)
   - Automatically linked to Section B
   - Only sees CSE-B students

3. **Students:**
   - Use actual IDs from Firebase (22B81A0565 - 22B81A05C8)
   - Already configured for Section B
   - Each will see their own dashboard

---

## Color Demonstration Matrix

| Marker → | Admin | Faculty | Result |
|----------|-------|---------|---------|
| Student sees | Blue BG | Green BG | Clear distinction |
| Badge color | Blue | Green | Matches background |
| Use case | Override/Late marking | Regular class marking | Normal flow |

---

## Tips for Demo

### ✅ **Before Presentation:**
1. Create at least 3 test accounts (1 admin, 1 faculty, 1 student)
2. Set simple passwords (e.g., `password` or `123456`)
3. Mark some attendance beforehand to show history
4. Test the color coding is working

### ✅ **During Presentation:**
1. **Show Faculty Flow:**
   - Login as faculty
   - Mark attendance (GREEN appears)
   
2. **Show Admin Flow:**
   - Login as admin
   - Override or mark new attendance (BLUE appears)
   
3. **Show Student View:**
   - Login as student
   - Show both colors side by side
   - Explain the distinction

4. **Show Reset Feature:**
   - Check time
   - Show it resets after 12 PM
   - Explain daily fresh start

### ✅ **Emergency Fallback:**
If Firebase data is not available:
- System uses localStorage
- Mock data still displays properly
- All features work in development mode

---

## Troubleshooting

### Issue: Can't see certain students
- Check section filter is set to "B"
- Check branch is set to "05" (CSE)

### Issue: Colors not showing
- Ensure `markedByRole` is being saved
- Check browser console for logs
- Verify attendance records have the role field

### Issue: Reset not working
- Check system time is past 12:00 PM
- Look for console logs: `[resetDailyAttendance]`
- Manually clear localStorage if needed

---

## Key Features to Highlight

1. ✅ **Role-Based Color Coding**
   - Green for Faculty
   - Blue for Admin
   - Clear visual distinction

2. ✅ **Daily Reset Mechanism**
   - Automatic reset after 12:00 PM
   - Fresh start every day
   - No manual intervention needed

3. ✅ **Real-time Updates**
   - Attendance appears immediately
   - Cross-tab synchronization via localStorage
   - Firebase real-time sync

4. ✅ **Section-Specific Access**
   - Faculty only sees their section
   - Admin sees all
   - Students see only their data

5. ✅ **Smart Data Persistence**
   - localStorage backup
   - Firebase cloud storage
   - Works offline-first

---

## Quick Reference Card

**For Presentation Day:**

| Account Type | Login ID | Purpose |
|-------------|----------|---------|
| Admin | `admin` | Show blue marking |
| Faculty | `22B81Z05B1` | Show green marking |
| Student | `22B81A0565` | Show combined view |

**Demo Sequence:**
1. Faculty marks → Green ✅
2. Admin marks → Blue ✅
3. Student views → Both colors visible ✅
4. Time passes 12 PM → Reset to gray ✅
