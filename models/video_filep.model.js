// models/video_filep.model.js
const mongoose = require('mongoose');

const videoFilepSchema = new mongoose.Schema({
  video_file_id: { type: Number, required: true },
  stream_key: String,
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
  file_source: String,
  source_type: String,
  file_url: String,
  label: { type: String, default: 'Server#1' },
  order: { type: Number, default: 0 },
  cre: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VideoFilep', videoFilepSchema);
