const { default: chalk } = require('chalk');
const mongoose = require('mongoose');

const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    await mongoose.connect('mongodb://localhost:27017/multiplex', options);
    console.log(chalk.bold.green('✨ 🎉 MongoDB connected successfully! 🚀 ✅'));
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;