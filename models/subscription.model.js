const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  plan_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  channel_id: { type: mongoose.Schema.Types.ObjectId, required: true },

  price_amount: { type: Number },           // ₹ value, e.g. 199
  paid_amount: { type: Number },            // ₹ value, e.g. 0 or 199

  timestamp_from: { type: Number, required: true },
  timestamp_to: { type: Number, required: true },

  payment_method: { type: String, required: true },

  // Store Razorpay order object as array of raw JSON (optional)
  payment_info: { type: [mongoose.Schema.Types.Mixed], required: true },

  recurring: { type: Number, required: true, default: 1 },
  status: { type: Number, required: true, default: 0 },
  ispayment: { type: Number, default: 0 },

  receipt: { type: String, required: true },
  razorpay_order_id: { type: String },

  // Extra details from Razorpay order
  currency: { type: String },
  amount: { type: Number },
  amount_due: { type: Number },
  amount_paid: { type: Number },
  created_at: { type: Number }

}, { collection: 'subscription' });

module.exports = mongoose.model('Subscription', subscriptionSchema);
