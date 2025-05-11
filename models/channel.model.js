const mongoose = require('mongoose');
const mongooseSequence = require("mongoose-sequence")(mongoose);

const channelSchema = new mongoose.Schema({
  channel_id: { type: Number, required: true },
  channel_name: { type: String, required: true },
  // Relationship: channel.user references a User document
  // user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  // You still associate it with the User model
    required: true,
  },
  deactivate_reason: String,
  last_login: Date,
  join_date: Date,
  status: { type: String, enum: ['pending', 'approve', 'rejected', 'block'], required: true, default: "pending" },
  doc3: String,
  doc2: String,
  doc1: String,
  mobile_number: String,
  organization_address: String,
  address: String,
  organization_name: String,
  last_name: String,
  first_name: String,
  email: String,
  password: { type: String, required: true },
  img: { type: String, default: 'https://multiplexplay.com/office/uploads/default_image/poster.jpg' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'channel'
});


channelSchema.plugin(mongooseSequence, {
  inc_field: "channel_id",
});

module.exports = mongoose.model('channel', channelSchema);
