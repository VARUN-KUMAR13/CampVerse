// DEBUG: Check Attendance Records in localStorage
// Paste this in browser console to see what's stored

console.log("=== ATTENDANCE DEBUG ===");

// Get all localStorage keys
const allKeys = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('attendance')) {
        allKeys.push(key);
    }
}

console.log(`Found ${allKeys.length} attendance-related keys:`);

// Check each key
allKeys.forEach(key => {
    try {
        const data = localStorage.getItem(key);
        if (data) {
            const record = JSON.parse(data);
            console.log('\n---');
            console.log('Key:', key);
            console.log('Student:', record.studentId);
            console.log('Slot:', record.slotId);
            console.log('Status:', record.status);
            console.log('MarkedBy:', record.markedBy);
            console.log('MarkedByRole:', record.markedByRole || 'NOT SET ❌');
            console.log('Full Record:', record);
        }
    } catch (e) {
        console.log('Error parsing:', key);
    }
});

console.log("\n=== SOLUTION ===");
console.log("If MarkedByRole is missing or wrong:");
console.log("1. Clear localStorage: localStorage.clear()");
console.log("2. Re-mark attendance as admin");
console.log("3. Check that admin dashboard sets markedByRole: 'ADMIN'");
