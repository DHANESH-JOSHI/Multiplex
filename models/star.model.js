const mongoose = require('mongoose');

const starSchema = new mongoose.Schema({
  star_id: { type: Number, required: true },
  star_type: String,
  star_name: String,
  slug: String,
  star_desc: String,
  view: { type: Number, default: 1 },
  status: { type: Number, default: 1 }
}, {collection: "star" });

module.exports = mongoose.model('Star', starSchema);
