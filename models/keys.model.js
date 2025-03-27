const mongoose = require('mongoose');

const keySchema = new mongoose.Schema({
  id: { type: Number, required: true },
  label: { type: String, default: 'System' },
  key: { type: String, required: true },
  level: { type: Number, required: true },
  ignore_limits: { type: Boolean, required: true, default: false },
  is_private_key: { type: Boolean, required: true, default: false },
  ip_addresses: String,
  date_created: { type: Number, required: true }
});

module.exports = mongoose.model('Key', keySchema);
