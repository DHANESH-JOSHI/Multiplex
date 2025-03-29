const { default: chalk } = require('chalk');
const mongoose = require('mongoose');

const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    await mongoose.connect('mongodb+srv://root:n6WmFL1HSV3dbSR7@dhanesh.was4l.mongodb.net/multiplex?retryWrites=true&w=majority', options);
    console.log(chalk.bold.green('✨ 🎉 MongoDB connected successfully! 🚀 ✅'));
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;