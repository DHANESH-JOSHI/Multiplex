// models/quality.model.js
const mongoose = require('mongoose');

const qualitySchema = new mongoose.Schema({
  quality_id: { type: Number, required: true },
  quality: String,
  description: String,
  status: { type: Number, default: 1 }
});

module.exports = mongoose.model('Quality', qualitySchema);
