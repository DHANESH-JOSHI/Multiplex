const razorpay = require('razorpay');
const crypto = require('crypto');
const dotenv = require('dotenv');
const currencySchema = require('../models/currency.model');
dotenv.config();

const instance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Service to create Razorpay order with multiple currencies
const createRazorpayOrder = async (amount, currencyCode) => {
  try {
    // Get the exchange rate for the provided currency

    const currency = await currencySchema.findOne({ iso_code: currencyCode });

    if (!currency) {
      throw new Error('Currency not supported');  
    }

    // Convert the amount to the desired currency
    const convertedAmount = amount ;

    // Create Razorpay order
    const options = {
      amount: convertedAmount, // Razorpay expects amount in paise
      currency: currency.iso_code,  // Currency from the database (e.g., INR, USD)
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1 // Auto capture payment
    };

    return new Promise((resolve, reject) => {
      instance.orders.create(options, (err, order) => {
        if (err) {
          return reject(err);
        }
        resolve(order);
      });
    });
  } catch (error) {
    console.error(error);
    throw new Error('Error creating Razorpay order');
  }
};

// Service to verify Razorpay payment
const verifyRazorpayPayment = (payment_id, order_id, signature) => {
  const body = `${order_id}|${payment_id}`;
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment
};
