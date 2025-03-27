// models/qrcode.model.js
const mongoose = require('mongoose');

const qrcodeSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  qr: { type: String, required: true },
  // Relationship: user_id → User
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dtime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Qrcode', qrcodeSchema);
