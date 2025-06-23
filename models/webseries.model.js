const mongoose = require("mongoose");

const webSeriesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  thumbnail_url: { type: String },
  poster_url: { type: String },
  genre: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Genre"
  }],
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "channel" },
  seasonsId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Season" }],
  price: { type: Number, default: 0 },
}, {
  timestamps: true,
  collection: "webseries"
});

module.exports = mongoose.model("WebSeries", webSeriesSchema);