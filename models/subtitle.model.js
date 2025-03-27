// models/subtitle.model.js
const mongoose = require('mongoose');

const subtitleSchema = new mongoose.Schema({
  subtitle_id: { type: Number, required: true },
  // Relationship: videos_id → Video
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  // Relationship: video_file_id → VideoFile
  video_file: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoFile' },
  language: String,
  kind: String,
  src: String,
  srclang: String,
  common: { type: Number, default: 0 },
  status: { type: Number, default: 1 }
});

module.exports = mongoose.model('Subtitle', subtitleSchema);
