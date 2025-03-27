// models/live_tv_url.model.js
const mongoose = require('mongoose');

const liveTvUrlSchema = new mongoose.Schema({
  live_tv_url_id: { type: Number, required: true },
  stream_key: String,
  // Relationship: live_tv_id → LiveTv
  live_tv: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveTv' },
  url_for: String,
  source: String,
  label: String,
  quality: String,
  url: String
});

module.exports = mongoose.model('LiveTvUrl', liveTvUrlSchema);
