const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  plan_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  channel_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  price_amount: { type: Number, required: false },
  paid_amount: { type: Number, required: false },
  timestamp_from: { type: Number, required: true },
  timestamp_to: { type: Number, required: true },
  payment_method: { type: String, required: true },
  payment_info: { type: String, required: true },
  payment_timestamp: { type: Number, required: true },
  recurring: { type: Number, required: true, default: 1 },
  status: { type: Number, required: true, default: 0 },
  ispayment: { type: Number, default: 0 },
  recipt: { type: String, required: true }
}, { collection: 'subscription' });

module.exports = mongoose.model('Subscription', subscriptionSchema);
