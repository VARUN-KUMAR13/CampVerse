# APPENDIX: SOURCE CODE SNIPPETS

The following figures present the key source code files of the CampVerse platform, captured from the Visual Studio Code development environment.

**Figure A.1:** `backend/server.js` – Main Express server application code showing global middleware configuration, MongoDB connection, Firebase Admin SDK initialization, and health-check route implementations. *(Lines 1–60)*

**Figure A.2:** `backend/routes/auth.js` – Authentication module showing dual login support handling both legacy system credentials and Firebase Auth ID tokens, along with JWT generation and automated database user provisioning. *(Lines 115–182)*

**Figure A.3:** `src/App.tsx` – Main React application component displaying routing logic using React Router v6, context providers setup, and protected role-based dashboard rendering for students, faculty, and administrators. *(Lines 110–165)*

**Figure A.4:** `src/services/api.ts` – Unified API service wrapper handling standardized REST requests, authentication token injection, global error interception, and comprehensive TypeScript interface definitions for core data models. *(Lines 9–60)*

**Figure A.5:** `backend/models/User.js` – Mongoose schema definition for the User model, including dynamic validation logic for college ID formatting (YYBBBSBBR), strict role-based requirements, and robust academic lifecycle attributes. *(Lines 3–70)*

**Figure A.6:** `src/services/attendanceService.ts` – Real-time attendance module showcasing deep Firebase Realtime Database integration, synchronous logging mechanisms, and real-time subscription handlers for live attendance tracking. *(Lines 344–410)*
