// models/subcribe.model.js
const mongoose = require('mongoose');

const subcribeSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  // Relationship: c_id assumed to reference Channel
  channel: { type: mongoose.Schema.Types.ObjectId, ref: 'channel', required: true },
  // Relationship: user_id → User
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Note the typo “creeated_at” is maintained here
  creeated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subcribe', subcribeSchema);
