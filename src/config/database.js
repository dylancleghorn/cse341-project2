const mongoose = require('mongoose');

module.exports = async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
};
