const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  await mongoose.connect(config.mongoUri);
  console.log('MongoDB Connected:', mongoose.connection.host);
};

module.exports = connectDB;
