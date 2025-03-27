// models/live_tv.model.js
const mongoose = require('mongoose');

const liveTvSchema = new mongoose.Schema({
  live_tv_id: { type: Number, required: true },
  tv_name: String,
  seo_title: String,
  // Relationship: live_tv_category_id → LiveTvCategory
  live_tv_category: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveTvCategory' },
  slug: String,
  language: { type: String, default: 'en' },
  stream_from: String,
  stream_label: String,
  stream_url: String,
  poster: String,
  thumbnail: String,
  focus_keyword: String,
  meta_description: String,
  featured: { type: Number, default: 1 },
  is_paid: { type: Number, required: true, default: 1 },
  tags: String,
  description: String,
  publish: { type: Number, default: 0 }
});

module.exports = mongoose.model('LiveTv', liveTvSchema);
