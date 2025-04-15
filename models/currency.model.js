const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
  currency_id: { type: Number, required: true },
  country: String, // The country the currency belongs to (e.g., India, US)
  currency: String, // Currency name (e.g., INR, USD)
  iso_code: String, // ISO code (e.g., INR, USD)
  symbol: String, // Currency symbol (e.g., ₹, $)
  exchange_rate: { type: Number, required: true, default: 1 }, // Exchange rate to base currency (INR)
  default: { type: Number, required: true, default: 0 }, // Default currency for the system
  status: { type: Number, required: true, default: 1 } // Currency status (active or inactive)
}, { collection: "currency" });

module.exports = mongoose.model('Currency', currencySchema);
