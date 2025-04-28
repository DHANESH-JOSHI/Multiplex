const mongoose = require('mongoose');
const mongooseSequence = require("mongoose-sequence")(mongoose);

const countrySchema = new mongoose.Schema({
  country_id: { type: Number, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String, required: true },
  slug: { type: String, required: true },
  publication: { type: Number, required: true },
  // collection: "country"
}, {collection: "country"});


countrySchema.plugin(mongooseSequence, { inc_field: 'country_id' });



module.exports = mongoose.model('country', countrySchema);