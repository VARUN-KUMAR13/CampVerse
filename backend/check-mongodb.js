console.log("Starting MongoDB connection test...");

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campverse';

console.log('Connection String:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('❌ MongoDB Connection Error:', error.message);
  console.log('\nTroubleshooting Tips:');
  console.log('1. Check if MongoDB is running (for local) or your internet connection (for Atlas)');
  console.log('2. Verify the connection string is correct');
  console.log('3. If using MongoDB Atlas, ensure your IP is whitelisted');
  process.exit(1);
});

db.once('open', () => {
  console.log('✅ Successfully connected to MongoDB!');
  console.log('Host:', mongoose.connection.host);
  console.log('Database:', mongoose.connection.name);
  
  // List all collections in the database
  mongoose.connection.db.listCollections().toArray((err, collections) => {
    if (err) {
      console.log('❌ Error listing collections:', err.message);
    } else {
      console.log('\n📋 Collections in the database:');
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    process.exit(0);
  });
});
