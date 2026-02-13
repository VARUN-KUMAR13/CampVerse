import { database, isDevelopment, firebaseReady } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export const getStudentNameByRoll = async (rollNumber: string): Promise<string | null> => {
  try {
    if (isDevelopment || !firebaseReady || !database) {
      console.log('[RealtimeService] Firebase not ready, returning null');
      return null;
    }

    console.log(`[RealtimeService] Fetching name for roll: ${rollNumber}`);

    // Strategy 1: Try common direct paths
    const candidatePaths = [
      `students/${rollNumber}/name`,
      `students/${rollNumber}/Name`,
      `students/${rollNumber}`,
      `users/${rollNumber}/name`,
      `users/${rollNumber}/Name`,
      `users/${rollNumber}`,
      `rollToName/${rollNumber}`,
    ];

    for (const path of candidatePaths) {
      try {
        const snapshot = await get(ref(database, path));
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (typeof val === 'string') {
            console.log(`[RealtimeService] Found name at ${path}: ${val}`);
            return val;
          }
          if (val && typeof val === 'object') {
            const name = val.name || val.Name || val["Name of the student"] || val.studentName;
            if (name) {
              console.log(`[RealtimeService] Found name at ${path}: ${name}`);
              return name;
            }
          }
        }
      } catch (e) {
        // Continue to next path
      }
    }

    // Strategy 2: Search through root-level entries
    try {
      const rootSnapshot = await get(ref(database));
      if (rootSnapshot.exists()) {
        const allData = rootSnapshot.val();

        // Check if rollNumber is a direct key
        if (allData[rollNumber] && typeof allData[rollNumber] === 'object') {
          const student = allData[rollNumber];
          const name = student["Name of the student"] || student.Name || student.name || student.studentName;
          if (name) {
            console.log(`[RealtimeService] Found name via direct key: ${name}`);
            return name;
          }
        }

        // Search through numeric keys for ROLL NO field match
        for (const key in allData) {
          if (['attendance', 'notifications', 'schedules', 'clubs', 'exams', 'jobs', 'users', 'students'].includes(key)) continue;

          const student = allData[key];
          if (student && typeof student === 'object') {
            const studentRoll = student["ROLL NO"] || student.rollNumber || student.collegeId || student["Roll No"];
            if (studentRoll === rollNumber) {
              const name = student["Name of the student"] || student.Name || student.name || student.studentName;
              if (name) {
                console.log(`[RealtimeService] Found name via root search: ${name}`);
                return name;
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('[RealtimeService] Root search failed:', e);
    }

    console.log(`[RealtimeService] No name found for ${rollNumber}`);
    return null;
  } catch (e) {
    console.warn('[RealtimeService] Realtime DB fetch failed:', e);
    return null;
  }
};
