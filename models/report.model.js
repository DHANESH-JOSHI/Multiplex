// models/report.model.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  report_id: { type: Number, required: true },
  type: String,
  // renamed field “id” to reported_id to avoid conflict with _id
  reported_id: Number,
  issue: String,
  report_datetime: { type: Date, default: Date.now },
  message: String,
  status: { type: String, default: 'pending' }
});

module.exports = mongoose.model('Report', reportSchema);
