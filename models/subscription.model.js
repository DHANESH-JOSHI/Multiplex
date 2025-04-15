const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  plan_id: { type: Number, required: true },
  price_amount: { type: Number, required: true },
  paid_amount: { type: Number, required: true },
  timestamp_from: { type: Number, required: true },
  timestamp_to: { type: Number, required: true },
  payment_method: { type: String, required: true },
  payment_info: { type: String, required: true },
  payment_timestamp: { type: Number, required: true },
  recurring: { type: Number, required: true, default: 1 },
  status: { type: Number, required: true, default: 0 },
  ispayment: { type: Number, default: 0 }
}, { collection: 'subscription' });

module.exports = mongoose.model('Subscription', subscriptionSchema);
