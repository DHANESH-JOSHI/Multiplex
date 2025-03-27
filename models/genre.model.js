const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  genre_id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  url: { type: String },
  image_url: { type: String },
  featured: { type: Number, default: 0 },
  publication: { type: Number, required: true },
}, { timestamps: true , collection: "genre" });


module.exports = mongoose.model('Genre', genreSchema);
