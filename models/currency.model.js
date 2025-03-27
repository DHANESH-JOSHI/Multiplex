// models/currency.model.js
const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
  currency_id: { type: Number, required: true },
  country: String,
  currency: String,
  iso_code: String,
  symbol: String,
  exchange_rate: { type: Number, required: true, default: 1 },
  default: { type: Number, required: true, default: 0 },
  status: { type: Number, required: true, default: 1 }
},{collection: "currency" });

module.exports = mongoose.model('Currency', currencySchema);
