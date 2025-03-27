const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  country_id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  slug: { type: String, required: true },
  publication: { type: Number, required: true },
  // collection: "country"
}, {collection: "country"});

module.exports = mongoose.model('country', countrySchema);