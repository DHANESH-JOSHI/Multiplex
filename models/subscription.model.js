const mongoose = require('mongoose');

const paymentInfoSchema = new mongoose.Schema({
  razorpay_order_id:   { type: String, required: true },
  razorpay_payment_id: { type: String, default: "" },    // optional now
  razorpay_signature:  { type: String, default: "" },    // optional now
  amount:              { type: Number, required: true },
  currency:            { type: String, default: 'INR' },
  status:              { type: String, default: 'created' }
}, { _id: false });

const subscriptionSchema = new mongoose.Schema({
  user_id:            { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  plan_id:            { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },
  channel_id:         { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'channel' },
  video_id:           { type: mongoose.Schema.Types.ObjectId, ref: 'Video', default: null },

  price_amount:       { type: Number },
  paid_amount:        { type: Number },

  timestamp_from:     { type: Number, required: true },
  timestamp_to:       { type: Number, required: true },

  payment_method:     { type: String, required: true },
  payment_info:       { type: [paymentInfoSchema], required: true },

  recurring:          { type: Number, default: 1 },
  status:             { type: Number, default: 1 },      // 1 = active, 0 = expired
  ispayment:          { type: Number, default: 0 },

  receipt:            { type: String, required: true },
  razorpay_order_id:  { type: String },

  currency:           { type: String },
  amount:             { type: Number },
  amount_due:         { type: Number },
  amount_paid:        { type: Number },
  created_at:         { type: Number }
}, { collection: 'subscription' });

module.exports = mongoose.model('Subscription', subscriptionSchema);
