/**
 * Quick script to add student 22B81A05C4 to Firebase
 * Run from browser console while logged in to CampVerse
 */

// This code should be pasted into the browser's Developer Console (F12)
// while logged into CampVerse as 22B81A05C4

(async function addStudent() {
    const rollNumber = '22B81A05C4';
    const studentData = {
        rollNumber: rollNumber,
        name: 'KATAKAM VARUN KUMAR',
        "Name of the student": 'KATAKAM VARUN KUMAR',
        "ROLL NO": rollNumber,
        section: 'C',
        Section: 'C',
        branch: '05',
        year: '22'
    };

    // Get Firebase auth instance from window
    const { auth, database } = await import('/src/lib/firebase.ts');
    const { ref, set } = await import('firebase/database');

    if (!auth?.currentUser) {
        console.error('Not logged in! Please log in first.');
        return;
    }

    console.log('Logged in as:', auth.currentUser.email);

    // Get auth token
    const token = await auth.currentUser.getIdToken();
    console.log('Got auth token');

    // Save to students/{rollNumber} path
    const studentRef = ref(database, `students/${rollNumber}`);
    await set(studentRef, studentData);
    console.log('✅ Student data saved to students/' + rollNumber);

    // Reload the page to see the change
    console.log('Refreshing in 2 seconds...');
    setTimeout(() => location.reload(), 2000);
})();
