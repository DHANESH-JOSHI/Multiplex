// models/subscription.model.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  subscription_id: { type: Number, required: true },
  // Relationship: plan_id → Plan
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  // Relationship: user_id → User
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price_amount: { type: Number, required: true },
  paid_amount: { type: Number, required: true },
  timestamp_from: { type: Number, required: true },
  timestamp_to: { type: Number, required: true },
  payment_method: { type: String, required: true },
  payment_info: { type: String, required: true },
  payment_timestamp: { type: Number, required: true },
  recurring: { type: Number, required: true, default: 1 },
  status: { type: Number, required: true, default: 1 },
  created_at: { type: Date, default: Date.now },
  ispayment: { type: Number, default: 0 }
},{collection: "subscription" });

module.exports = mongoose.model('Subscription', subscriptionSchema);
