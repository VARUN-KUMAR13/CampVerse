import { database, isDevelopment, firebaseReady } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export const getStudentNameByRoll = async (rollNumber: string): Promise<string | null> => {
  try {
    if (isDevelopment || !firebaseReady || !database) return null;

    // Try common paths
    const candidatePaths = [
      `students/${rollNumber}/name`,
      `users/${rollNumber}/name`,
      `rollToName/${rollNumber}`,
    ];

    for (const path of candidatePaths) {
      const snapshot = await get(ref(database, path));
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (typeof val === 'string') return val;
        if (val && typeof val.name === 'string') return val.name;
      }
    }
    return null;
  } catch (e) {
    console.warn('Realtime DB fetch failed:', e);
    return null;
  }
};
