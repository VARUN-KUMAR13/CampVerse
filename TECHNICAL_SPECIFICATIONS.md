# CampVerse: Technical Specifications & API Design

## 1. Database Schema Design

### 1.1 User Collection/Table

```javascript
{
  _id: ObjectId,
  uid: String,                    // Firebase UID
  collegeId: String,              // Unique college registration number
  name: String,
  email: String,
  phone: String,
  role: Enum('student', 'faculty', 'admin'),

  // Student-specific fields
  year: Number,                   // 1, 2, 3, 4
  section: String,                // A, B, C
  branch: String,                 // CSE, ECE, Mechanical, etc.
  rollNumber: String,

  // Faculty-specific fields
  department: String,
  designation: String,            // Professor, Assistant Professor, etc.
  courses: [ObjectId],            // References to courses taught

  // Common fields
  avatar: String,                 // Profile picture URL
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date,
}
```

### 1.2 Course Collection

```javascript
{
  _id: ObjectId,
  courseCode: String,             // CS201, ME101
  title: String,
  description: String,
  credits: Number,
  department: String,

  faculty: {
    _id: ObjectId,                // Faculty ID
    name: String,
  },

  schedule: [{
    day: Enum('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
    startTime: String,            // HH:MM format
    endTime: String,
    room: String,
  }],

  enrolledStudents: [ObjectId],   // Student IDs
  sections: [String],             // A, B, C sections this course has
  semester: Number,               // 1-8
  academicYear: String,           // 2024-2025

  createdAt: Date,
  updatedAt: Date,
}
```

### 1.3 Attendance Collection (Priority for Next Phase)

```javascript
{
  _id: ObjectId,
  courseId: ObjectId,             // Reference to course
  sectionId: String,              // Section A, B, C
  date: Date,                     // Attendance date

  attendanceRecords: [{
    studentId: ObjectId,
    rollNumber: String,           // Denormalized for quick access
    status: Enum('attended', 'not-attended', 'pending', 'excused'),
    markedAt: Date,               // Exact timestamp
    markedBy: ObjectId,           // Faculty ID
    remarks: String,              // Optional remarks
    lastModified: Date,           // For audit trail
    modifiedBy: [ObjectId],       // List of who modified it
  }],

  markedBy: ObjectId,             // Faculty who marked attendance
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes for Performance**:

```javascript
db.attendance.createIndex({ courseId: 1, date: 1 });
db.attendance.createIndex({ "attendanceRecords.studentId": 1, date: 1 });
db.attendance.createIndex({ markedBy: 1, createdAt: -1 });
```

### 1.4 Exam Collection

```javascript
{
  _id: ObjectId,
  title: String,
  subject: String,
  courseId: ObjectId,

  schedule: {
    date: Date,
    startTime: String,            // HH:MM
    endTime: String,
    duration: Number,             // In minutes
    room: String,
  },

  // Granular targeting
  targetGroups: [{
    type: Enum('class', 'section', 'branch', 'year', 'individual'),
    value: String,                // e.g., "CSE", "Section A", "23BB1A3201"
  }],

  eligibleStudents: [ObjectId],   // Pre-calculated for quick access
  maxMarks: Number,
  description: String,
  instructions: String,

  createdBy: ObjectId,            // Admin/Faculty who created
  status: Enum('draft', 'published', 'completed', 'cancelled'),

  createdAt: Date,
  updatedAt: Date,
}
```

### 1.5 Assignment Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  courseId: ObjectId,

  deadline: Date,
  totalMarks: Number,
  attachments: [String],          // URLs to files

  targetGroups: [{
    type: Enum('section', 'year', 'branch', 'individual'),
    value: String,
  }],

  submissions: [{
    studentId: ObjectId,
    submittedAt: Date,
    files: [String],              // Submission file URLs
    text: String,                 // Optional text submission
    status: Enum('submitted', 'late', 'missing', 'graded'),

    grade: Number,
    feedback: String,
    gradedAt: Date,
    gradedBy: ObjectId,           // Faculty ID
  }],

  createdBy: ObjectId,            // Faculty ID
  createdAt: Date,
  updatedAt: Date,
}
```

### 1.6 Notification Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: Enum('attendance_alert', 'assignment_due', 'exam_schedule', 'grade_posted'),
  title: String,
  message: String,
  data: {
    courseId: ObjectId,
    examId: ObjectId,
    // ... context-specific data
  },

  isRead: Boolean,
  readAt: Date,

  channels: {
    inApp: Boolean,
    email: Boolean,
    sms: Boolean,
  },

  createdAt: Date,
  expiresAt: Date,                // Auto-delete old notifications
}
```

---

## 2. API Endpoints Specification

### 2.1 Authentication Endpoints

```
POST /api/auth/login
Description: Authenticate user
Request:
{
  "collegeId": "23BB1A3201",
  "password": "password123"
}
Response (Success):
{
  "success": true,
  "user": { User object },
  "token": "jwt_token_here",
  "expiresIn": 86400
}
Response (Error):
{
  "success": false,
  "message": "Invalid credentials"
}

POST /api/auth/refresh
Description: Refresh JWT token
Headers: Authorization: Bearer token
Response: { "token": "new_jwt_token" }

POST /api/auth/logout
Description: Logout user
Headers: Authorization: Bearer token
Response: { "success": true }

POST /api/auth/reset-password
Description: Request password reset
Request: { "collegeId": "23BB1A3201" }
Response: { "message": "Reset link sent to email" }
```

### 2.2 Attendance Endpoints (Core Feature)

```
POST /api/attendance/mark
Description: Mark student attendance
Headers: Authorization: Bearer token
Role: Faculty only
Request:
{
  "courseId": "507f1f77bcf86cd799439011",
  "sectionId": "A",
  "date": "2024-01-15T10:30:00Z",
  "attendanceRecords": [
    {
      "studentId": "507f1f77bcf86cd799439012",
      "status": "attended"
    }
  ]
}
Response:
{
  "success": true,
  "attendanceRecords": [
    {
      "studentId": "507f1f77bcf86cd799439012",
      "status": "attended",
      "markedAt": "2024-01-15T10:30:45Z"
    }
  ]
}

GET /api/attendance/:courseId
Description: Get attendance records for a course
Query: ?date=2024-01-15&sectionId=A
Response:
{
  "courseId": "507f1f77bcf86cd799439011",
  "attendanceRecords": [ ... ]
}

GET /api/attendance/student/:studentId
Description: Get student's attendance percentage
Response:
{
  "studentId": "507f1f77bcf86cd799439012",
  "attendanceData": {
    "january": {
      "present": 18,
      "absent": 2,
      "total": 20,
      "percentage": 90
    }
  },
  "overallPercentage": 87.5
}

PUT /api/attendance/:attendanceId/record/:recordId
Description: Update a single attendance record (correct mistakes)
Headers: Authorization: Bearer token
Role: Faculty only
Request:
{
  "status": "not-attended",
  "remarks": "Corrected from attendance"
}
Response: { "success": true, "record": { ... } }

DELETE /api/attendance/:attendanceId/record/:recordId
Description: Delete attendance record
Headers: Authorization: Bearer token
Role: Admin only
Response: { "success": true }
```

### 2.3 Exam Endpoints

```
POST /api/exams
Description: Create exam
Headers: Authorization: Bearer token
Role: Admin only
Request:
{
  "title": "Midterm Exam",
  "subject": "Algorithms",
  "courseId": "507f1f77bcf86cd799439011",
  "schedule": {
    "date": "2024-02-15T10:00:00Z",
    "duration": 120,
    "room": "201"
  },
  "targetGroups": [
    { "type": "year", "value": "2" },
    { "type": "branch", "value": "CSE" }
  ],
  "maxMarks": 100
}
Response:
{
  "success": true,
  "exam": { Exam object },
  "eligibleStudentsCount": 245
}

GET /api/exams
Description: Get exams visible to current user
Query: ?upcoming=true (for student)
Response:
{
  "exams": [ ... ],
  "total": 5
}

GET /api/exams/:examId
Description: Get exam details
Response: { Exam object }

PUT /api/exams/:examId
Description: Update exam
Headers: Authorization: Bearer token
Role: Admin only
Response: { "success": true, "exam": { ... } }

DELETE /api/exams/:examId
Description: Cancel exam
Headers: Authorization: Bearer token
Role: Admin only
Response: { "success": true }
```

### 2.4 User Management Endpoints

```
GET /api/users/:userId
Description: Get user profile
Response: { User object }

PUT /api/users/:userId
Description: Update user profile
Request:
{
  "name": "Updated Name",
  "phone": "9876543210",
  "avatar": "image_url"
}
Response: { "success": true, "user": { ... } }

POST /api/users/change-password
Description: Change password
Request:
{
  "currentPassword": "old123",
  "newPassword": "new456"
}
Response: { "success": true }

GET /api/users
Description: List all users (Admin only)
Query: ?role=faculty&page=1&limit=20
Response:
{
  "users": [ ... ],
  "pagination": {
    "total": 450,
    "page": 1,
    "limit": 20,
    "pages": 23
  }
}
```

---

## 3. Authentication & Authorization

### 3.1 JWT Token Structure

```javascript
{
  header: {
    alg: "HS256",
    typ: "JWT"
  },
  payload: {
    userId: "507f1f77bcf86cd799439011",
    email: "student@college.edu",
    role: "student",
    collegeId: "23BB1A3201",
    iat: 1705316400,
    exp: 1705402800  // 24 hours
  },
  signature: "..."
}
```

### 3.2 Role-Based Permissions

```javascript
const permissions = {
  student: {
    "attendance:read": true, // Can view own attendance
    "course:read": true, // Can view enrolled courses
    "assignment:submit": true,
    "exam:read": true,
  },
  faculty: {
    "attendance:write": true, // Can mark attendance
    "grade:write": true,
    "assignment:create": true,
    "course:manage": true,
    "assignment:grade": true,
  },
  admin: {
    "*": true, // Full access
  },
};
```

### 3.3 Middleware Implementation

```javascript
// Auth middleware
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
});

// Role check middleware
const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Insufficient permissions" });
  }
  next();
};

// Usage
app.post("/api/attendance/mark", requireRole(["faculty"]), markAttendance);
```

---

## 4. Real-Time Architecture (WebSocket)

### 4.1 Socket.io Connection Flow

```javascript
// Client side
const socket = io("https://api.campverse.com", {
  auth: {
    token: localStorage.getItem("auth_token"),
  },
});

// Server side
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  socket.user = jwt.verify(token, process.env.JWT_SECRET);
  next();
});

// Join rooms by role/course
socket.on("connect", () => {
  socket.join(`user:${socket.user.userId}`);
  socket.join(`role:${socket.user.role}`);
  if (socket.user.role === "student") {
    socket.join(`student:${socket.user.studentId}`);
  }
});
```

### 4.2 Real-Time Events

```javascript
// When faculty marks attendance
socket.emit("attendance:marked", {
  courseId: "507f1f77bcf86cd799439011",
  studentId: "507f1f77bcf86cd799439012",
  status: "attended",
  markedAt: "2024-01-15T10:30:45Z",
});

// Broadcast to all connected users of that course
io.to(`course:${courseId}`).emit("attendance:updated", {
  studentId: "507f1f77bcf86cd799439012",
  status: "attended",
});

// Notify specific student
io.to(`student:${studentId}`).emit("you_marked_present", {
  course: "Algorithms",
  time: "10:30 AM",
});

// Admin announcement
socket.emit("announcement:broadcast", {
  targetRole: "student",
  message: "Exams scheduled for Feb 15",
  priority: "high",
});

io.to(`role:student`).emit("announcement:received", {
  message: "Exams scheduled for Feb 15",
});
```

---

## 5. Error Handling & Status Codes

### 5.1 HTTP Status Codes Used

```javascript
200  OK                    // Request successful
201  Created              // Resource created
400  Bad Request          // Invalid request data
401  Unauthorized         // Missing/invalid auth token
403  Forbidden            // Insufficient permissions
404  Not Found            // Resource doesn't exist
409  Conflict             // Resource already exists (duplicate)
422  Unprocessable Entity // Validation error
500  Internal Server Error// Server error
503  Service Unavailable  // Server temporarily down
```

### 5.2 Error Response Format

```javascript
{
  "success": false,
  "error": {
    "code": "INVALID_DATA",
    "message": "Student ID not found",
    "details": {
      "field": "studentId",
      "value": "invalid123"
    }
  },
  "timestamp": "2024-01-15T10:30:45Z"
}
```

---

## 6. Performance Optimization Strategies

### 6.1 Database Indexing

```javascript
// Create indexes for frequent queries
db.attendance.createIndex({ courseId: 1, date: 1 });
db.attendance.createIndex({ "attendanceRecords.studentId": 1 });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ collegeId: 1 }, { unique: true });
db.courses.createIndex({ faculty: 1 });
db.exams.createIndex({ date: 1, status: 1 });
```

### 6.2 Caching Strategy

```javascript
// Redis cache for frequently accessed data
const cache = redis.createClient();

// Cache user profiles (5 minute TTL)
app.get("/api/users/:userId", async (req, res) => {
  const cached = await cache.get(`user:${req.params.userId}`);
  if (cached) return res.json(JSON.parse(cached));

  const user = await User.findById(req.params.userId);
  await cache.setex(`user:${req.params.userId}`, 300, JSON.stringify(user));
  res.json(user);
});

// Cache attendance percentage (1 hour TTL)
app.get("/api/attendance/student/:studentId/percentage", async (req, res) => {
  const cached = await cache.get(`attendance:${req.params.studentId}`);
  if (cached) return res.json(JSON.parse(cached));

  const percentage = calculatePercentage(req.params.studentId);
  await cache.setex(
    `attendance:${req.params.studentId}`,
    3600,
    JSON.stringify(percentage),
  );
  res.json(percentage);
});
```

### 6.3 Pagination for Large Lists

```javascript
// Backend
app.get("/api/attendance/:courseId/records", (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 50;
  const skip = (page - 1) * limit;

  const records = Attendance.findOne({ courseId }).then((doc) => ({
    records: doc.attendanceRecords.slice(skip, skip + limit),
    pagination: {
      total: doc.attendanceRecords.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(doc.attendanceRecords.length / limit),
    },
  }));

  res.json(records);
});

// Frontend
const [page, setPage] = useState(1);
const { data } = useQuery(["attendance", courseId, page], () =>
  api.get(`/attendance/${courseId}/records?page=${page}`),
);
```

---

## 7. Testing Strategy

### 7.1 Unit Tests (Vitest)

```typescript
// Test attendance calculation
import { describe, it, expect } from "vitest";
import { calculateAttendancePercentage } from "@/lib/attendance";

describe("calculateAttendancePercentage", () => {
  it("should calculate percentage correctly", () => {
    const records = [
      { status: "attended" },
      { status: "attended" },
      { status: "not-attended" },
      { status: "attended" },
    ];
    expect(calculateAttendancePercentage(records)).toBe(75);
  });
});
```

### 7.2 API Integration Tests

```javascript
// Test attendance marking endpoint
describe("POST /api/attendance/mark", () => {
  it("should mark attendance successfully", async () => {
    const response = await request(app)
      .post("/api/attendance/mark")
      .set("Authorization", `Bearer ${token}`)
      .send({
        courseId: "course123",
        attendanceRecords: [{ studentId: "student123", status: "attended" }],
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

---

## 8. Security Considerations

### 8.1 Input Validation

```javascript
const { body, validationResult } = require("express-validator");

app.post(
  "/api/attendance/mark",
  body("courseId").isMongoId().notEmpty(),
  body("attendanceRecords").isArray().notEmpty(),
  body("attendanceRecords.*.studentId").isMongoId(),
  body("attendanceRecords.*.status").isIn([
    "attended",
    "not-attended",
    "pending",
  ]),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    // Process request
  },
);
```

### 8.2 Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});

app.use("/api/", limiter);
```

### 8.3 CORS Configuration

```javascript
const cors = require("cors");

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
```

---

## 9. Deployment Configuration

### 9.1 Environment Variables

```env
# Frontend (.env)
VITE_API_BASE_URL=https://api.campverse.com
VITE_WS_URL=wss://api.campverse.com
VITE_FIREBASE_API_KEY=...

# Backend (.env)
NODE_ENV=production
PORT=5000
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/campverse
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=24h
FRONTEND_URL=https://campverse.com
CORS_ORIGIN=https://campverse.com
```

### 9.2 Docker Configuration

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 10. Monitoring & Logging

### 10.1 Error Tracking (Sentry)

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### 10.2 Structured Logging

```javascript
const logger = require("winston");

logger.info("Attendance marked", {
  courseId: courseId,
  markedBy: userId,
  studentCount: records.length,
  timestamp: new Date(),
});

logger.error("Database connection failed", {
  error: error.message,
  stack: error.stack,
});
```

---

**This specification document is your technical reference. Know these schemas and APIs well before your interview!**
