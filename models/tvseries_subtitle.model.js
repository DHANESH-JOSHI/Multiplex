const mongoose = require('mongoose');

const tvseriesSubtitleSchema = new mongoose.Schema({
  tvseries_subtitle_id: { type: Number, required: true },
  // videos_id is stored as string per original schema (adjust if needed)
  video_id: String,
  // Relationship: episodes_id → Episode
  episode: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode' },
  language: String,
  kind: String,
  src: String,
  srclang: String,
  common: { type: Number, default: 0 },
  status: { type: Number, default: 1 }
});

module.exports = mongoose.model('TvseriesSubtitle', tvseriesSubtitleSchema);
