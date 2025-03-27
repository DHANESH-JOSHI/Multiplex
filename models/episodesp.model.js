// models/episodep.model.js
const mongoose = require('mongoose');

const episodepSchema = new mongoose.Schema({
  episodes_id: { type: Number, required: true },
  stream_key: String,
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
  season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season' },
  episodes_name: String,
  file_source: String,
  source_type: String,
  file_url: String,
  order: { type: Number, default: 0 },
  last_ep_added: { type: Date, default: Date.now },
  date_added: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EpisodeP', episodepSchema);
