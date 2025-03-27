// models/live_tv_category.model.js
const mongoose = require('mongoose');

const liveTvCategorySchema = new mongoose.Schema({
  live_tv_category_id: { type: Number, required: true },
  live_tv_category: String,
  live_tv_category_desc: String,
  status: { type: Number, default: 1 },
  slug: String
},{collection: "live_tv_category" });

module.exports = mongoose.model('LiveTvCategory', liveTvCategorySchema);
