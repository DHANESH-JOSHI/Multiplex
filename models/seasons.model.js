const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  seasons_id: { type: Number, required: true },
  // Relationship: videos_id → Video
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
  seasons_name: String,
  publish: { type: Number, default: 1 },
  order: { type: Number, default: 0 }
});

module.exports = mongoose.model('Season', seasonSchema);