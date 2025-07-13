const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  plan_id: { type: String, required: true },
  name: { type: String, required: true },
  country: { type: String, required: true },  // ISO IN, USA, UAE
  currency: { type: String, required: true },
  day: { type: Number, default: 0 },
  screens: { type: Number, default: 0 },
  price: { type: Number, required: true },
  status: { type: Number, required: true },
  is_movie: { type: Boolean, default: false }, // true for movies, false for webseries
  type: { type: String, enum: ['monthly', 'quarterly', 'yearly', 'custom'], default: 'monthly' }
}, { collection: "plan", timestamps: true });

module.exports = mongoose.model('Plan', planSchema);