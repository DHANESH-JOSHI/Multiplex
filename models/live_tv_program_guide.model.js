// models/live_tv_program_guide.model.js
const mongoose = require('mongoose');

const liveTvProgramGuideSchema = new mongoose.Schema({
  live_tv_program_guide_id: { type: Number, required: true },
  // Relationship: live_tv_id → LiveTv
  live_tv: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveTv', required: true },
  title: { type: String, required: true },
  video_url: String,
  date: { type: Date, required: true },
  time: { type: String, required: true },
  type: { type: String, enum: ['onaired', 'upcoming'], default: 'upcoming' },
  status: { type: Number, required: true, default: 1 }
});

module.exports = mongoose.model('LiveTvProgramGuide', liveTvProgramGuideSchema);
