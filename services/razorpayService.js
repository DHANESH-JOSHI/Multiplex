const razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv");
const currencySchema = require("../models/currency.model");
dotenv.config();

const instance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Service to create Razorpay order with multiple currencies (auto-capture enabled)
const createRazorpayOrder = async (amount, currencyCode) => {
  try {
    // Set default currency if not provided
    const finalCurrencyCode = currencyCode || 'INR';
    console.log("🔍 Currency lookup:", { originalCurrencyCode: currencyCode, finalCurrencyCode });
    
    // First try to find the requested currency
    let currency = await currencySchema.findOne({ iso_code: finalCurrencyCode });
    console.log("💰 Currency found:", currency ? { iso_code: currency.iso_code, status: currency.status } : "null");

    // If INR not found, try to find USD as fallback
    if (!currency && finalCurrencyCode === 'INR') {
      console.log("⚠️  INR not found, trying USD as fallback...");
      currency = await currencySchema.findOne({ iso_code: 'USD' });
      console.log("💰 USD fallback found:", currency ? { iso_code: currency.iso_code, status: currency.status } : "null");
    }

    if (!currency) {
      console.log("❌ Currency not found in database for:", finalCurrencyCode);
      // Check what currencies are available (first 10)
      const availableCurrencies = await currencySchema.find({}, { iso_code: 1, status: 1 }).limit(10);
      console.log("📋 Available currencies (first 10):", availableCurrencies);
      
      // Use the first available currency as final fallback
      if (availableCurrencies.length > 0) {
        currency = availableCurrencies[0];
        console.log("🔄 Using fallback currency:", currency.iso_code);
      } else {
        throw new Error(`No currencies found in database`);
      }
    }
    
    if (currency.status !== 1) {
      throw new Error(`Currency is inactive: ${currency.iso_code}`);
    }

    // Convert the amount (you can apply exchange logic here if needed)
    const convertedAmount = amount;

    // Create Razorpay order with auto-capture
    const options = {
      amount: convertedAmount, // amount in smallest unit (paise for INR, cents for USD, etc.)
      currency: currency.iso_code,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // Auto-capture ✅
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
    throw new Error("Error creating Razorpay order");
  }
};

// Service to verify Razorpay payment signature
const verifyRazorpayPayment = (payment_id, order_id, signature) => {
  const body = `${order_id}|${payment_id}`;

  const expectedSignatureHex = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  const expectedSignatureBase64 = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("base64");

  const isHexMatch = expectedSignatureHex === signature;
  const isBase64Match = expectedSignatureBase64 === signature;
  const isValid = isHexMatch || isBase64Match;

  console.log("🔍 Signature Verification Debug:", {
    body,
    received_signature: signature,
    expected_hex: expectedSignatureHex,
    expected_base64: expectedSignatureBase64,
    hex_match: isHexMatch,
    base64_match: isBase64Match,
    is_valid: isValid,
  });

  return isValid;
};

// Service to get payment details with configurable timeout
const getPaymentDetails = async (payment_id, timeoutMs = 30000) => {
  try {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.error(`⏰ Razorpay API timeout after ${timeoutMs/1000} seconds`);
        reject(new Error("Razorpay API timeout"));
      }, timeoutMs);

      instance.payments.fetch(payment_id, (err, payment) => {
        clearTimeout(timeout);

        if (err) {
          console.error("❌ Error fetching payment details:", err);
          return reject(err);
        }
        console.log("✅ Payment details fetched successfully");
        resolve({ success: true, payment });
      });
    });
  } catch (error) {
    console.error("❌ Error fetching payment details:", error);
    return { success: false, error: error.message };
  }
};

// Service to capture payment (for authorized payments)
const captureRazorpayPayment = async (payment_id, amount, currency) => {
  try {
    return new Promise((resolve, reject) => {
      const captureOptions = {
        amount: amount,
        currency: currency
      };

      const timeout = setTimeout(() => {
        console.error("⏰ Payment capture timeout after 30 seconds");
        reject(new Error("Payment capture timeout"));
      }, 30000);

      instance.payments.capture(payment_id, amount, currency, (err, payment) => {
        clearTimeout(timeout);

        if (err) {
          console.error("❌ Payment capture error:", err);
          return reject(err);
        }
        console.log("✅ Payment captured successfully:", payment.id);
        resolve(payment);
      });
    });
  } catch (error) {
    console.error("❌ Error capturing payment:", error);
    throw error;
  }
};

// Service to refund payment
const refundPayment = async (payment_id, amount) => {
  try {
    const refundOptions = {
      payment_id,
      amount: amount || undefined, // If no amount, full refund
    };

    return new Promise((resolve, reject) => {
      instance.payments.refund(payment_id, refundOptions, (err, refund) => {
        if (err) {
          console.error("❌ Refund Error:", err);
          return reject({
            success: false,
            error: err.description || err.message,
          });
        }
        console.log("✅ Refund processed successfully:", refund.id);
        resolve({ success: true, refund });
      });
    });
  } catch (error) {
    console.error("❌ Error processing refund:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  captureRazorpayPayment,
  getPaymentDetails,
  refundPayment,
};
