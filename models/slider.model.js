// models/slider.model.js
const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
  slider_id: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: 'NA' },
  video_link: { type: String, required: true },
  image_link: { type: String, required: true },
  slug: { type: String, required: true },
  action_type: String,
  action_btn_text: String,
  action_id: Number,
  action_url: String,
  order: { type: Number, default: 0 },
  publication: { type: Number, required: true }
}, {collection: "slider" });

module.exports = mongoose.model('Slider', sliderSchema);
