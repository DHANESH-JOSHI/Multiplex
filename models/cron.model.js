// models/cron.model.js
const mongoose = require('mongoose');

const cronSchema = new mongoose.Schema({
  cron_id: { type: Number, required: true },
  type: { type: String, required: true },
  action: { type: String, required: true },
  image_url: { type: String, required: true },
  save_to: String,
  // Relationship: videos_id → Video
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
  admin_email_from: String,
  admin_email: String,
  email_to: String,
  email_sub: String,
  message: { type: String, required: true }
});

module.exports = mongoose.model('Cron', cronSchema);
