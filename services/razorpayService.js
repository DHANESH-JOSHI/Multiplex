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
  
  // Generate expected signatures in both formats
  const expectedSignatureHex = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
    
  const expectedSignatureBase64 = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('base64');

  // Check both hex and base64 formats
  const isHexMatch = expectedSignatureHex === signature;
  const isBase64Match = expectedSignatureBase64 === signature;
  const isValid = isHexMatch || isBase64Match;

  // Debug signature verification
  console.log('🔍 Signature Verification Debug:', {
    body,
    received_signature: signature,
    expected_hex: expectedSignatureHex,
    expected_base64: expectedSignatureBase64,
    hex_match: isHexMatch,
    base64_match: isBase64Match,
    is_valid: isValid,
    key_secret_length: process.env.RAZORPAY_KEY_SECRET?.length || 0
  });

  return isValid;
};

// Service to capture payment (for manual capture orders)
const captureRazorpayPayment = async (payment_id, amount) => {
  try {
    return new Promise((resolve, reject) => {
      instance.payments.capture(payment_id, amount, (err, payment) => {
        if (err) {
          console.error('❌ Razorpay Capture Error:', err);
          return reject(err);
        }
        console.log('✅ Payment captured successfully:', payment.id);
        resolve(payment);
      });
    });
  } catch (error) {
    console.error('❌ Error capturing Razorpay payment:', error);
    throw new Error('Error capturing Razorpay payment');
  }
};

// Service to get payment details
const getPaymentDetails = async (payment_id) => {
  try {
    return new Promise((resolve, reject) => {
      instance.payments.fetch(payment_id, (err, payment) => {
        if (err) {
          console.error('❌ Error fetching payment details:', err);
          return reject(err);
        }
        resolve({ success: true, payment });
      });
    });
  } catch (error) {
    console.error('❌ Error fetching payment details:', error);
    return { success: false, error: error.message };
  }
};

// Service to refund payment
const refundPayment = async (payment_id, amount) => {
  try {
    const refundOptions = {
      payment_id,
      amount: amount || undefined // If no amount, full refund
    };
    
    return new Promise((resolve, reject) => {
      instance.payments.refund(payment_id, refundOptions, (err, refund) => {
        if (err) {
          console.error('❌ Refund Error:', err);
          return reject({ success: false, error: err.description || err.message });
        }
        console.log('✅ Refund processed successfully:', refund.id);
        resolve({ success: true, refund });
      });
    });
  } catch (error) {
    console.error('❌ Error processing refund:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  captureRazorpayPayment,
  getPaymentDetails,
  refundPayment
};
