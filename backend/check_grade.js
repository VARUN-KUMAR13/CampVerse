require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const grades = mongoose.connection.collection('gradesheets');
    const sheets = await grades.find({ subjectName: /Organizational/i }).toArray();
    console.log(JSON.stringify(sheets.map(s => ({
        id: s._id,
        name: s.subjectName,
        degree: s.degree,
        year: s.year,
        branch: s.branch,
        section: s.section,
        semester: s.semester,
        status: s.status
    })), null, 2));
    process.exit(0);
}).catch(console.error);
