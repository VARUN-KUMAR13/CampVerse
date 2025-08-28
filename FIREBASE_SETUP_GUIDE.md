# Firebase Setup Guide for CampVerse

Your project already has Firebase integration configured! Here's how to complete the setup and use it for your student dashboard.

## 🔥 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" 
3. Enter project name: `campverse-app` (or your preferred name)
4. Enable Google Analytics (optional)
5. Create project

## 🔧 Step 2: Configure Firebase Services

### Enable Authentication
1. In Firebase Console → **Authentication** → **Get started**
2. **Sign-in method** tab → Enable **Email/Password**
3. **Users** tab → You can manually add users or let them register

### Enable Firestore Database
1. **Firestore Database** → **Create database**
2. Choose **Start in test mode** (we'll secure it later)
3. Select your region (closest to your users)

### Enable Storage (for file uploads)
1. **Storage** → **Get started**
2. Start in test mode
3. Choose region

## 🔑 Step 3: Get Firebase Configuration

1. In Firebase Console → **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Web** icon (`</>`)
4. Register app name: `CampVerse`
5. Copy the **firebaseConfig** object

## 📝 Step 4: Set Environment Variables

Create a `.env` file in your project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# EmailJS Configuration (already set up)
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# Development
VITE_NODE_ENV=development
VITE_API_URL=http://localhost:3001
```

## 🎓 Step 5: Firebase for Student Dashboard

Your project supports these authentication patterns:

### College ID Format: `YYBBBSBBR`
- **YY**: Year (22, 23, 24...)
- **BBB**: College code (B81)
- **S**: Section (A, B, C...)
- **BB**: Branch code (05 for CSE)
- **R**: Roll number (C3, C4...)

**Examples:**
- Student: `22B81A05C3` → email: `22B81A05C3@cvr.ac.in`
- Faculty: `22B81Z05F1` → email: `22B81Z05F1@cvr.ac.in`
- Admin: `admin` → email: `admin@cvr.ac.in`

## 🗄️ Step 6: Firestore Database Structure

Your student data will be stored like this:

```
📁 users/
  📄 {userId}/
    - uid: "firebase-user-id"
    - name: "Student Name"
    - collegeId: "22B81A05C3"
    - email: "22B81A05C3@cvr.ac.in"
    - role: "student" | "faculty" | "admin"
    - year: "22"
    - section: "A"
    - branch: "05"
    - rollNumber: "C3"
    - profile: {
        phone: "+91 9876543210"
        dateOfBirth: "2003-01-15"
        address: "Hyderabad, Telangana"
        bio: "Student bio..."
      }

📁 courses/
  📄 {courseId}/
    - name: "Data Structures"
    - code: "CS202"
    - faculty: "Dr. Smith"
    - students: ["22B81A05C3", "22B81A05C4"]

📁 assignments/
  📄 {assignmentId}/
    - title: "Binary Trees Implementation"
    - courseId: "cs202"
    - dueDate: "2024-02-15"
    - submissions: {...}
```

## 🔐 Step 7: Security Rules

Update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Students can read course data they're enrolled in
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        resource.data.faculty == request.auth.token.email;
    }
    
    // Assignment rules
    match /assignments/{assignmentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 🎯 Step 8: Using Firebase in Your Components

The project already includes:

✅ **Authentication Context** - `useAuth()` hook  
✅ **User Management** - Login/logout/password reset  
✅ **Development Mode** - Works without Firebase for testing  
✅ **College ID Validation** - Automatic role detection  

### Example Usage:

```typescript
import { useAuth } from '@/contexts/AuthContext';

function StudentDashboard() {
  const { currentUser, userData, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!currentUser) return <div>Please login</div>;
  
  return (
    <div>
      <h1>Welcome, {userData?.name}!</h1>
      <p>College ID: {userData?.collegeId}</p>
      <p>Role: {userData?.role}</p>
    </div>
  );
}
```

## 🚀 Step 9: Testing

1. **Development Mode**: Works without Firebase credentials
   - Default login: `22B81A05C3` / `22B81A05C3`
   - Admin login: `admin` / `admin`

2. **Production Mode**: Requires Firebase setup
   - Users login with college ID and password
   - Data syncs with Firestore

## 📊 Step 10: Adding Student Data to Firestore

Once Firebase is connected, you can:

1. **Import Student Data**: Bulk upload via Firebase Admin SDK
2. **Manual Entry**: Use Firebase Console
3. **Registration System**: Let students create profiles
4. **CSV Import**: Custom script to import existing data

## 🛠️ Next Steps

1. Set up your Firebase project
2. Add environment variables
3. Test authentication
4. Import your student dataset
5. Customize dashboard based on your data

Your CampVerse app will then have:
- ✅ Secure student authentication
- ✅ Real-time data sync
- ✅ Role-based access control
- ✅ Scalable database structure
- ✅ File storage capabilities

Need help with any specific step? Let me know!
