const mongoose = require('mongoose');
require('dotenv').config();

async function checkDB() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campverse');
    console.log('Connected to MongoDB\n');

    // Placements
    const placements = await mongoose.connection.db.collection('placements').find({}).toArray();
    console.log('=== PLACEMENTS (' + placements.length + ') ===');
    placements.forEach(job => {
        console.log('- ' + job.job_id + ': ' + job.title + ' at ' + job.company + ' (' + job.status + ')');
    });

    // Events
    console.log('');
    const events = await mongoose.connection.db.collection('events').find({}).toArray();
    console.log('=== EVENTS (' + events.length + ') ===');
    events.forEach(event => {
        console.log('- ' + event.event_id + ': ' + event.title + ' (' + event.category + ') - ' + event.status);
    });

    // Clubs
    console.log('');
    const clubs = await mongoose.connection.db.collection('clubs').find({}).toArray();
    console.log('=== CLUBS (' + clubs.length + ') ===');
    clubs.forEach(club => {
        console.log('- ' + club.club_id + ': ' + club.name + ' (' + club.category + ') - ' + club.status);
    });

    console.log('\n=== USERS ===');
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('Total users: ' + users.length);
    users.forEach(u => {
        console.log('- ' + u.collegeId + ' (' + u.role + ') - ' + u.name);
    });

    await mongoose.disconnect();
    console.log('\nDone!');
}

checkDB().catch(console.error);
