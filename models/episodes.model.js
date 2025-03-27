const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  episodes_id: { type: Number, required: true },
  stream_key: String,

  // Relationship: videos_id → Video (fallback to videos_id as ObjectId)
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    default: function () {
      return this.videos_id ? new mongoose.Types.ObjectId(this.videos_id) : this._id;
    }
  },

  // Relationship: seasons_id → Season (fallback to seasons_id as ObjectId)
  season: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
    default: function () {
      return this.seasons_id ? new mongoose.Types.ObjectId(this.seasons_id) : this._id;
    }
  },

  episodes_name: String,
  file_source: String,
  source_type: String,
  file_url: String,
  order: { type: Number, default: 0 },

  last_ep_added: { type: Date, default: new Date(0) },
  date_added: { type: Date, default: new Date(0) }
});

// ✅ Register model
const Episode = mongoose.model('Episode', episodeSchema);
module.exports = Episode;
