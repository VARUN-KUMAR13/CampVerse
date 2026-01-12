require('dotenv').config();
const mongoose = require('mongoose');

console.log('Attempting to connect to MongoDB...');
console.log('Connection String:', process.env.MONGODB_URI || 'mongodb://localhost:27017/campverse');

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campverse', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout
  })
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('MongoDB Host:', mongoose.connection.host);
    console.log('MongoDB Database:', mongoose.connection.name);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('\nTroubleshooting Tips:');
    console.log('1. Make sure MongoDB is running locally or the remote server is accessible');
    console.log('2. Check if the connection string is correct');
    console.log('3. If using MongoDB Atlas, ensure your IP is whitelisted');
    console.log('4. Check your internet connection if connecting to a remote server');
    process.exit(1);
  });
