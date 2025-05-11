// Updated Subscription Schema with correct sub-schema for payment_info
const mongoose = require('mongoose');

const paymentInfoSchema = new mongoose.Schema({
  razorpay_order_id: { type: String, required: true },
  razorpay_payment_id: { type: String, required: true },
  razorpay_signature: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, default: 'success' }
}, { _id: false });

const subscriptionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  plan_id: { type: mongoose.Schema.Types.ObjectId, required: false },
  channel_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  video_id: { type: mongoose.Schema.Types.ObjectId, required: false },

  price_amount: { type: Number },
  paid_amount: { type: Number },

  timestamp_from: { type: Number, required: true },
  timestamp_to: { type: Number, required: true },

  payment_method: { type: String, required: true },
  payment_info: { type: [paymentInfoSchema], required: true },

  recurring: { type: Number, required: true, default: 1 },
  status: { type: Number, required: true, default: 0 },
  ispayment: { type: Number, default: 0 },

  receipt: { type: String, required: true },
  razorpay_order_id: { type: String },

  currency: { type: String },
  amount: { type: Number },
  amount_due: { type: Number },
  amount_paid: { type: Number },
  created_at: { type: Number }
}, { collection: 'subscription' });

module.exports = mongoose.model('Subscription', subscriptionSchema);