const mongoose = require("mongoose");

const webSeriesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image_url: { type: String },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "channel" },
  seasonsId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Season" }],
}, {
  timestamps: true,
  collection: "webseries"
});

module.exports = mongoose.model("WebSeries", webSeriesSchema);