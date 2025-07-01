const mongoose = require('mongoose');

const subcribeSchema = new mongoose.Schema({

  channel: { type: String, ref: 'channel', required: true },
  // Relationship: user_id → User
  user: { type: String, ref: 'User', required: true },
  // Note the typo “creeated_at” is maintained here
  creeated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subcribe', subcribeSchema);