// models/ci_sessions.model.js
const mongoose = require('mongoose');

const ciSessionsSchema = new mongoose.Schema({
  // Use the session id as the document _id
  _id: { type: String, required: true },
  ip_address: { type: String, required: true },
  timestamp: { type: Number, required: true, default: 0 },
  data: { type: Buffer, required: true }
}, { versionKey: false ,
  collection: 'cisession'
});


module.exports = mongoose.model('CiSession', ciSessionsSchema);
