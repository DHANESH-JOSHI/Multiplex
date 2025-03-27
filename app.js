const express = require('express');
const connectDB = require('./config/db');
const MobileApiRoutes = require('./routes/api/v130.js');
const apiKeyMiddleware = require('./middleware/apiKey.js');
// const channelRoutes = require('./routes/api/channel.routes.js');
// const subscriptionRoutes = require('./routes/api/subscription.routes.js');
const chalk = require('chalk');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();

// Clear console before starting
console.clear();

// Security middleware
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(apiKeyMiddleware); // Apply API key check to all incoming requests

// Routes
app.use('/rest-api/v130', MobileApiRoutes);
// app.use('/rest-api/v130/channel', channelRoutes);
// app.use('/rest-api/v130/check_user_subscription_status',  subscriptionRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.clear(); // Clear console again when server starts
  console.log('\x1b[32m%s\x1b[0m', '🚀 Server Status: ' + '\x1b[34mOnline\x1b[0m');
  console.log('\x1b[33m%s\x1b[0m', '📡 Port: ' + '\x1b[36m' + PORT + '\x1b[0m');
  console.log('\x1b[35m%s\x1b[0m', '⏰ Time: ' + '\x1b[37m' + new Date().toLocaleString() + '\x1b[0m');
  console.log('\x1b[31m%s\x1b[0m', '⚡ Environment: ' + '\x1b[37m' + (process.env.NODE_ENV || 'development') + '\x1b[0m');
  console.log('\x1b[36m%s\x1b[0m', '🛣️  Routes: ');
  console.log('\x1b[37m%s\x1b[0m', '   - /rest-api/v130');
});