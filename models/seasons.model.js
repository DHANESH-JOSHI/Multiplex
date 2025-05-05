const mongoose = require("mongoose");

const seasonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  webSeries: { type: mongoose.Schema.Types.ObjectId, ref: "WebSeries" },
  episodesId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Episode" }],
}, {
  timestamps: true,
  collection: "seasons"
});

module.exports = mongoose.model("Season", seasonSchema);
