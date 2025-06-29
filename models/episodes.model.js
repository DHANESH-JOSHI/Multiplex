const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  video_url: { type: String, required: true },
  videoContent_id: { type: Number, required: true }, 
  seasonId: { type: mongoose.Schema.Types.ObjectId, ref: "Season" },
  is_movie: { type: Boolean },
}, {
  timestamps: true,
  collection: "episodes"
});

module.exports = mongoose.model("Episode", episodeSchema);
