const mongoose = require('mongoose');

const videoFileSchema = new mongoose.Schema({
  video_file_id: { type: Number, required: true },
  stream_key: String,
  // Relationship: videos_id → Video
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
  file_source: { type: String, default: 'abcd' },
  source_type: { type: String, default: 'upload' },
  file_url: String,
  label: { type: String, required: true, default: 'Server#1' },
  order: { type: Number, default: 0 }
});

module.exports = mongoose.model('VideoFile', videoFileSchema);
