import app, { isDevelopment } from '@/lib/firebase';
import { getDatabase, ref, get, child } from 'firebase/database';

export const getStudentNameByRoll = async (rollNumber: string): Promise<string | null> => {
  try {
    if (isDevelopment || !app) return null;
    const db = getDatabase(app);

    // Try common paths
    const candidatePaths = [
      `students/${rollNumber}/name`,
      `users/${rollNumber}/name`,
      `rollToName/${rollNumber}`,
    ];

    for (const path of candidatePaths) {
      const snapshot = await get(ref(db, path));
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
