const mongoose = require('mongoose');
const mongooseSequence = require("mongoose-sequence")(mongoose);

const genreSchema = new mongoose.Schema({
  genre_id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  url: { type: String , default: "https://multiplexplay.com/office/genre/action.html" },
  image_url: { type: String , default: "https://multiplexplay.com/office/uploads/default_image/genre.png" },
  featured: { type: Number, default: 0 },
  publication: { type: Number, required: true },
}, { timestamps: true , collection: "genre" });

genreSchema.plugin(mongooseSequence, { inc_field: 'genre_id' });
module.exports = mongoose.model('Genre', genreSchema);



