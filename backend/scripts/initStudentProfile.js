const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createStudentProfile() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if user exists
        const existingUser = await User.findOne({ collegeId: '22B81A05C3' });

        if (existingUser) {
            console.log('📌 User already exists:', existingUser);

            // Update with default profile data
            existingUser.phone = existingUser.phone || '';
            existingUser.address = existingUser.address || '';
            existingUser.dateOfBirth = existingUser.dateOfBirth || '';
            existingUser.bio = existingUser.bio || '';
            existingUser.cgpa = existingUser.cgpa || '';
            existingUser.branch = existingUser.branch || '05';
            existingUser.semester = existingUser.semester || 'VI';
            existingUser.skills = existingUser.skills || [];
            existingUser.achievements = existingUser.achievements || [];
            existingUser.avatar = existingUser.avatar || '';

            await existingUser.save();
            console.log('✅ User profile initialized with default values');
        } else {
            console.log('❌ User not found. Please create the user first using seedAdmin.js');
        }

        await mongoose.disconnect();
        console.log('✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createStudentProfile();
