const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  config_id: { type: Number, required: true },
  title: { type: String, required: true },
  value: { type: String, required: true },
  
}, {collection: "config"});

module.exports = mongoose.model('config', configSchema);