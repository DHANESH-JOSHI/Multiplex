const mongoose = require('mongoose');

const languagesIsoSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: String,
  iso: String
});

module.exports = mongoose.model('LanguagesIso', languagesIsoSchema);