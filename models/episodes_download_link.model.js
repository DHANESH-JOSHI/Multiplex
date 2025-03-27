// models/episode_download_link.model.js
const mongoose = require('mongoose');

const episodeDownloadLinkSchema = new mongoose.Schema({
  episode_download_link_id: { type: Number, required: true },
  // Relationship: videos_id → Video
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
  // season_id remains a string (adjust if needed)
  season_id: String,
  // Relationship: e_id → Episode
  e: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode' },
  link_title: String,
  resolution: { type: String, required: true, default: '720p' },
  file_size: { type: String, required: true, default: '00MB' },
  download_url: String,
  in_app_download: { type: Boolean, required: true, default: true }
});

module.exports = mongoose.model('EpisodeDownloadLink', episodeDownloadLinkSchema);
