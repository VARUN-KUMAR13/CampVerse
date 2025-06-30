# 🔐 CampVerse Authentication System Setup

This guide will help you set up the complete authentication system for CampVerse using Firebase Authentication and MongoDB.

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Firebase project
- Git

## 🚀 Setup Instructions

### 1. Firebase Setup

1. **Create Firebase Project**:

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project named "CampVerse"
   - Enable Authentication with Email/Password provider

2. **Get Firebase Config**:

   - Go to Project Settings → General → Your apps
   - Add a web app and copy the config object
   - Update `src/lib/firebase.ts` with your config

3. **Create Service Account**:

   - Go to Project Settings → Service Accounts
   - Generate new private key
   - Download the JSON file and save the values for backend `.env`

4. **Configure Authentication**:
   - Go to Authentication → Sign-in method
   - Enable Email/Password
   - Add `cvr.ac.in` to authorized domains

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your Firebase and MongoDB credentials
nano .env
```

**Environment Variables**:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/campverse

# Firebase Admin SDK (from service account JSON)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com

# Server
PORT=5000
ADMIN_SETUP_KEY=your-secure-random-key
```

### 3. Frontend Setup

Update `src/lib/firebase.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};
```

### 4. Database Setup

```bash
# Start MongoDB (if running locally)
mongod

# In backend directory, seed the admin user
npm run seed
```

### 5. Run the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend (from root)
npm run dev
```

## 🎯 Authentication Features

### ✅ Implemented Features

1. **College ID Authentication**:

   - Format: `22B81A05C3` (Year + College Code + Section + Branch + Roll)
   - Auto-generates email: `22B81A05C3@cvr.ac.in`
   - Default password equals college ID

2. **Role-Based Access**:

   - **Students**: Sections A-F → `/student/dashboard`
   - **Faculty**: Section Z → `/faculty/dashboard`
   - **Admin**: ID "admin" → `/admin/dashboard`

3. **Security Features**:

   - Firebase Authentication
   - JWT token verification
   - Password reset via email
   - Input validation
   - Protected routes

4. **Database Integration**:
   - MongoDB with Mongoose ODM
   - User profile storage
   - Session management
   - Admin controls

### 🆔 College ID Format

```
22B81A05C3
││││││││└─ Roll Number (C3)
│││││││└── Branch Code (05 = CSE)
││││││└─── Section (A-F = Student, Z = Faculty)
│││││└──── College Code (B81)
││││└───── College Code (continued)
│││└────── College Code (continued)
││└─────── Year of Joining (22 = 2022)
│└──────── Year of Joining (continued)
└───────── Year of Joining (continued)
```

### 🏢 Branch Codes

- `01` - Civil Engineering
- `02` - Mechanical Engineering
- `03` - Electrical Engineering
- `04` - Electronics and Communication
- `05` - Computer Science and Engineering
- `06` - Information Technology
- `07` - Chemical Engineering
- `08` - Aeronautical Engineering
- `09` - Biotechnology
- `10` - Data Science

## 🔑 Default Accounts

### Admin Account

- **ID**: `admin`
- **Password**: `admin`
- **Email**: `admin@cvr.ac.in`
- **Role**: Admin

### Test Student Account

You can create test accounts with format: `22B81A05C3`

- **ID**: `22B81A05C3`
- **Password**: `22B81A05C3` (default)
- **Email**: `22B81A05C3@cvr.ac.in`
- **Role**: Student (Section A)

### Test Faculty Account

Faculty accounts have section "Z": `22B81Z05F1`

- **ID**: `22B81Z05F1`
- **Password**: `22B81Z05F1` (default)
- **Email**: `22B81Z05F1@cvr.ac.in`
- **Role**: Faculty

## 📱 API Endpoints

### Authentication

- `POST /api/auth/verify` - Verify Firebase token
- `POST /api/auth/setup-admin` - One-time admin setup
- `GET /api/auth/stats` - Get user statistics (admin only)

### User Management

- `POST /api/users` - Create new user
- `GET /api/users/:uid` - Get user by Firebase UID
- `GET /api/users/college-id/:collegeId` - Get user by college ID
- `PUT /api/users/:uid` - Update user profile
- `GET /api/users` - Get all users (admin only)
- `DELETE /api/users/:uid` - Delete user (admin only)

## 🛡️ Security Features

1. **Input Validation**:

   - College ID format validation
   - Email domain restriction (@cvr.ac.in)
   - Role-based section validation

2. **Authentication**:

   - Firebase JWT tokens
   - Secure password reset
   - Session management

3. **Authorization**:
   - Role-based route protection
   - Admin-only endpoints
   - User data isolation

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Error**:

   - Check Firebase config in `src/lib/firebase.ts`
   - Verify project ID and API keys

2. **MongoDB Connection Error**:

   - Ensure MongoDB is running
   - Check connection string in `.env`

3. **CORS Error**:

   - Backend runs on port 5000
   - Frontend should point to `http://localhost:5000/api`

4. **Authentication Error**:
   - Verify Firebase service account keys
   - Check email domain restrictions

### Debug Steps

1. **Check Backend Logs**:

   ```bash
   cd backend
   npm run dev
   ```

2. **Test API Health**:

   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Verify MongoDB Connection**:
   ```bash
   mongo campverse
   db.users.find()
   ```

## 📚 Next Steps

1. **Production Deployment**:

   - Set up environment variables
   - Configure Firebase security rules
   - Set up MongoDB Atlas

2. **Additional Features**:

   - Email verification
   - Multi-factor authentication
   - Session timeout
   - Audit logging

3. **Testing**:
   - Unit tests for authentication
   - Integration tests for API
   - E2E tests for user flows

## 📞 Support

If you encounter any issues:

1. Check the console logs (browser and backend)
2. Verify environment variables
3. Test with default admin account
4. Review Firebase project settings

---

🎉 **Your CampVerse authentication system is now ready!**

Login with:

- **Student**: Any valid college ID (e.g., `22B81A05C3`)
- **Faculty**: College ID with section Z (e.g., `22B81Z05F1`)
- **Admin**: `admin` / `admin`
