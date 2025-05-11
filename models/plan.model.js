const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },  // ISO IN, USA, UAE
  day: { type: Number, default: 0 },
  screens: { type: Number, default: 0 },
  price: { type: Number, required: true },
  status: { type: Number, required: true }
}, { collection: "plan", timestamps: true });

module.exports = mongoose.model('Plan', planSchema);