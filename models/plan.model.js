const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  plan_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  country: { type: String, required: true }, // e.g., 'IN', 'US'
  day: { type: Number, default: 0 }, // Duration in days
  screens: { type: Number,default: 0 },
  price: { type: Number, required: true }, // Store price as string
  status: { type: Number, required: true } // 1 = active, 0 = inactive
}, { collection: "plans", timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
