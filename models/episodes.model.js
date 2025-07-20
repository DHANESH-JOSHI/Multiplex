const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  video_url: { type: String, required: true },
  videoContent_id: { type: String, required: true },
  seasonId: { type: mongoose.Schema.Types.ObjectId, ref: "Season" },
  is_movie: { type: Boolean },
  thumbnail_url: { type: String},
  description: { type: String, default: "" },
  enable_download: {
    type: String,
    Default: 1
  },

  download_link: {
    type: String,
  },
}, {
  timestamps: true,
  collection: "episodes"
});

module.exports = mongoose.model("Episode", episodeSchema);