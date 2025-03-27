// models/log.model.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  uri: { type: String, required: true },
  method: { type: String, required: true },
  params: String,
  api_key: { type: String, required: true },
  ip_address: { type: String, required: true },
  time: { type: Number, required: true },
  rtime: Number,
  authorized: { type: String, required: true },
  response_code: { type: Number, default: 0 }
});

module.exports = mongoose.model('Log', logSchema);
