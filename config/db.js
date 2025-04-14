const { default: chalk } = require('chalk');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();



const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };
  let DB_URL = process.env.MONGOURL;
  try {
    await mongoose.connect(DB_URL, options);
    console.log(chalk.bold.green('✨ 🎉 MongoDB connected successfully! 🚀 ✅'));
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;