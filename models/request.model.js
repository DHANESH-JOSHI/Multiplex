// models/request.model.js
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  request_id: { type: Number, required: true },
  name: String,
  email: String,
  movie_name: String,
  message: String,
  request_datetime: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }
});

module.exports = mongoose.model('Request', requestSchema);
