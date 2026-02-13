/**
 * Firebase Student Data Import Script
 * 
 * This script imports student data into Firebase Realtime Database
 * in the correct format for the CampVerse attendance system.
 * 
 * Run this script using: node backend/scripts/importStudents.js
 */

const admin = require('firebase-admin');
require('dotenv').config();

// Firebase Admin SDK initialization
// You need to download your service account key from Firebase Console
// Project Settings > Service Accounts > Generate New Private Key

// Check if we have service account credentials
let serviceAccount;
try {
    serviceAccount = require('../serviceAccountKey.json');
} catch (error) {
    console.log('Service account key not found. Using database URL method...');
}

// Initialize Firebase Admin
if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || 'https://campverse-2004-default-rtdb.asia-southeast1.firebasedatabase.app'
    });
} else {
    // Alternative: Use database URL only (requires proper security rules)
    admin.initializeApp({
        databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || 'https://campverse-2004-default-rtdb.asia-southeast1.firebasedatabase.app'
    });
}

const db = admin.database();

// Section B Students (22B81A05B1 to 22B81A05B66)
const sectionBStudents = [];
for (let i = 1; i <= 66; i++) {
    const num = i.toString().padStart(2, '0');
    sectionBStudents.push({
        rollNumber: `22B81A05B${num}`,
        name: `Student B${num}`,
        section: 'B',
        branch: '05',
        year: '22',
        email: `22b81a05b${num}@example.com`
    });
}

// Section C Students (22B81A05C1 to 22B81A05C66) - Including your roll number
const sectionCStudents = [
    { rollNumber: '22B81A05C1', name: 'Student C01', section: 'C', branch: '05', year: '22' },
    { rollNumber: '22B81A05C2', name: 'Student C02', section: 'C', branch: '05', year: '22' },
    { rollNumber: '22B81A05C3', name: 'KATAKAM VARUN KUMAR', section: 'C', branch: '05', year: '22' },
    { rollNumber: '22B81A05C4', name: 'KATAKAM VARUN KUMAR', section: 'C', branch: '05', year: '22' }, // Your actual roll number
];

// Add more C section students
for (let i = 5; i <= 66; i++) {
    const num = i.toString().padStart(2, '0');
    sectionCStudents.push({
        rollNumber: `22B81A05C${num}`,
        name: `Student C${num}`,
        section: 'C',
        branch: '05',
        year: '22',
        email: `22b81a05c${num}@example.com`
    });
}

// Section A Students
const sectionAStudents = [];
for (let i = 1; i <= 66; i++) {
    const num = i.toString().padStart(2, '0');
    sectionAStudents.push({
        rollNumber: `22B81A05A${num}`,
        name: `Student A${num}`,
        section: 'A',
        branch: '05',
        year: '22',
        email: `22b81a05a${num}@example.com`
    });
}

async function importStudents() {
    console.log('Starting student data import to Firebase...\n');

    try {
        // Import by section for organized access
        const updates = {};

        // Add Section A students
        sectionAStudents.forEach(student => {
            updates[`students/section_A/${student.rollNumber}`] = student;
            updates[`students/${student.rollNumber}`] = student;
        });

        // Add Section B students
        sectionBStudents.forEach(student => {
            updates[`students/section_B/${student.rollNumber}`] = student;
            updates[`students/${student.rollNumber}`] = student;
        });

        // Add Section C students
        sectionCStudents.forEach(student => {
            updates[`students/section_C/${student.rollNumber}`] = student;
            updates[`students/${student.rollNumber}`] = student;
        });

        // Perform the multi-path update
        await db.ref().update(updates);

        console.log('✅ Successfully imported students to Firebase!');
        console.log(`   - Section A: ${sectionAStudents.length} students`);
        console.log(`   - Section B: ${sectionBStudents.length} students`);
        console.log(`   - Section C: ${sectionCStudents.length} students`);
        console.log(`   - Total: ${sectionAStudents.length + sectionBStudents.length + sectionCStudents.length} students`);
        console.log('\nData paths created:');
        console.log('   - students/{rollNumber}');
        console.log('   - students/section_A/{rollNumber}');
        console.log('   - students/section_B/{rollNumber}');
        console.log('   - students/section_C/{rollNumber}');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error importing students:', error.message);
        process.exit(1);
    }
}

// Run the import
importStudents();
