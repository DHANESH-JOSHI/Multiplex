// models/download_link.model.js
const mongoose = require('mongoose');

const downloadLinkSchema = new mongoose.Schema({
  download_link_id: { type: Number, required: true },
  // Relationship: videos_id → Video
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
  vimeo_id: { type: String, default: '0' },
  link_title: String,
  resolution: { type: String, required: true, default: '720p' },
  file_size: { type: String, required: true, default: '00MB' },
  download_url: String,
  in_app_download: { type: Boolean, required: true, default: false }
});

module.exports = mongoose.model('DownloadLink', downloadLinkSchema);
