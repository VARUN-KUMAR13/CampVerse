const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campverse";
    console.log("Connecting to:", mongoUri);
    await mongoose.connect(mongoUri);
    const users = await mongoose.connection.collection('users').find().toArray();
    console.log("Users:", users.map(u => ({
      uid: u.uid, collegeId: u.collegeId, email: u.email, role: u.role, isActive: u.isActive
    })));
  } catch(e) { console.error(e) }
  process.exit(0);
}
check();
