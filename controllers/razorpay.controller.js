const razorpayService = require('../services/razorpayService');
const Subscription = require('../models/subscription.model');
const Plan = require('../models/plan.model');

// Controller to create Razorpay order
const createOrder = async (req, res) => {
  const { user_id, plan_id, currency_code } = req.body;
  const plan = await Plan.findOne({ plan_id });

  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  try {
    const amount = parseFloat(plan.price);
    
    // Create Razorpay order with the selected currency
    const order = await razorpayService.createRazorpayOrder(amount, currency_code);

    // Save subscription to the database
    const subscription = new Subscription({
      user_id,
      plan_id: plan.plan_id,
      price_amount: amount,
      paid_amount: 0, // Payment pending
      timestamp_from: Date.now(),
      timestamp_to: Date.now() + (plan.day * 24 * 60 * 60 * 1000),
      payment_method: 'Razorpay',
      payment_info: 'Pending',
      payment_timestamp: null,
      recurring: 1,
      status: 0, // Pending
      ispayment: 0,
      order_id: order.id // Store Razorpay order ID for later use
    });

    await subscription.save();

    res.json({
      order_id: order.id,
      amount: amount,
      currency: currency_code // Send currency code in response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating order' });
  }
};

module.exports = {
  createOrder
};
