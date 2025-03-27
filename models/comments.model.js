const mongoose = require('mongoose');

const commentsSchema = new mongoose.Schema({
  comments_id: { type: Number, required: true },
  
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  comment_type: { type: Number, default: 1 },
  replay_for: { type: Number, default: 0 },
  comment: String,
  comment_at: Date,
  publication: { type: Number, default: 0 }
});

module.exports = mongoose.model('Comment', commentsSchema);