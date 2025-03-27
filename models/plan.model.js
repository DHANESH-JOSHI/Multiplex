// models/plan.model.js
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  plan_id: { type: Number, required: true },
  name: { type: String, required: true },
  day: { type: Number, default: 0 },
  screens: String,
  price: { type: String, required: true },
  status: { type: Number, required: true }
});

module.exports = mongoose.model('Plan', planSchema);
