
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend/.env
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const Assignment = require('./backend/models/Assignment');

async function checkAssignments() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const assignments = await Assignment.find({});
        console.log('Total Assignments:', assignments.length);

        assignments.forEach(a => {
            console.log('---');
            console.log('Title:', a.title);
            console.log('Degree:', a.degree);
            console.log('Year:', a.year);
            console.log('Semester:', a.semester);
            console.log('Section:', a.section);
            console.log('Status:', a.status);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkAssignments();
