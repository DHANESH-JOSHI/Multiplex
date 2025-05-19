const axios = require("axios");
const { createRazorpayOrder } = require('../../services/razorpayService');
const SubscriptionSchema = require('../../models/subscription.model');
const planSchema = require('../../models/plan.model');
// Create Razorpay order and save subscription
exports.addSubscription = async (req, res) => {
    try {
        const { 
            plan_id, 
            user_id, 
            ammount, 
            currencyCode, 
            channel_id, 
            video_id,
            country, 
            price_amount, 
            paid_amount, 
            custom_duration
        } = req.body;

        const now = Date.now();

        // 0. Check if user already has an active subscription
        if (plan_id) {
            const activePlan = await SubscriptionSchema.findOne({
                user_id,
                plan_id,
                channel_id,
                status: 1,
                timestamp_to: { $gt: now }
            });

            if (activePlan) {
                return res.status(400).json({
                    message: "User already has an active subscription for this plan",
                    subscription: activePlan
                });
            }
        } else if (video_id) {
            const activeVideo = await SubscriptionSchema.findOne({
                user_id,
                video_id,
                channel_id,
                status: 1,
                timestamp_to: { $gt: now }
            });

            if (activeVideo) {
                return res.status(400).json({
                    message: "User already has an active subscription for this video",
                    subscription: activeVideo
                });
            }
        }

        // 1. Create Razorpay Order
        const razorpayOrder = await createRazorpayOrder(ammount, currencyCode);
        // console.log(razorpayOrder);

        const currentTimestamp = Date.now();
        let validityPeriod;

        // 2. Validity Period calculation
        if (!plan_id) {
            if (!video_id) {
                return res.status(400).json({ message: "Missing video_id for single video purchase" });
            }

            validityPeriod = 45 * 24 * 60 * 60 * 1000; // 45 days
        } else {
            const plan = await planSchema.findById(plan_id);

            if (!plan) {
                return res.status(400).json({ message: "Invalid plan_id" });
            }

            if ((plan.type === "custom" && plan.day) || custom_duration) {
                validityPeriod = (plan.day || custom_duration) * 24 * 60 * 60 * 1000;
            } else {
                switch (plan.type) {
                    case "monthly":
                        validityPeriod = 30 * 24 * 60 * 60 * 1000;
                        break;
                    case "quarterly":
                        validityPeriod = 90 * 24 * 60 * 60 * 1000;
                        break;
                    case "yearly":
                        validityPeriod = 365 * 24 * 60 * 60 * 1000;
                        break;
                    default:
                        validityPeriod = 30 * 24 * 60 * 60 * 1000;
                }
            }
        }

        const timestamp_from = currentTimestamp;
        const timestamp_to = currentTimestamp + validityPeriod;

        // 3. Save Subscription
        const newSubscription = new SubscriptionSchema({
            plan_id: plan_id || null,
            user_id,
            channel_id,
            video_id,
            price_amount,
            paid_amount,
            timestamp_from,
            timestamp_to,
            payment_method: "Razorpay",
            payment_info: [{
                razorpay_order_id: razorpayOrder.id,
                razorpay_payment_id: "",
                razorpay_signature: "",
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                status: "created"
            }],
            payment_timestamp: currentTimestamp,
            receipt: razorpayOrder.receipt,
            razorpay_order_id: razorpayOrder.id,
            currency: razorpayOrder.currency,
            amount: razorpayOrder.amount,
            amount_due: razorpayOrder.amount_due,
            amount_paid: razorpayOrder.amount_paid,
            created_at: razorpayOrder.created_at,
            status: 1
        });

        const savedSubscription = await newSubscription.save();

        res.status(201).json({
            message: "Razorpay order created and subscription added successfully",
            data: {
                subscription: savedSubscription,
                razorpayOrder
            }
        });

    } catch (error) {
        console.error("Error in createSubscriptionWithPayment:", error);
        res.status(500).json({ message: "Failed to create subscription with payment", error: error.message });
    }
};

exports.updatePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, status } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment parameters" });
    }

    const now = Date.now();
    const updated = await SubscriptionSchema.findOneAndUpdate(
      { "payment_info.0.razorpay_order_id": razorpay_order_id },
      {
        $set: {
          "payment_info.0.razorpay_payment_id": razorpay_payment_id,
          "payment_info.0.razorpay_signature": razorpay_signature,
          "payment_info.0.status": "paid",
          ispayment: 1,
          is_active: 1,
          status: 1,
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Subscription not found for this order_id" });
    }

    return res.status(200).json({
      message: "Payment info updated, subscription active",
      data: updated
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error updating payment", error: err.message });
  }
};



// Get all subscriptions
exports.getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await SubscriptionSchema.find();
        res.status(200).json({ message: "Subscriptions fetched successfully", data: subscriptions });
    } catch (error) {
        res.status(500).json({ message: "Error fetching subscriptions", error: error.message });
    }
};

// Get single subscription by ID
exports.getSubscriptionById = async (req, res) => {
    try {
        console.log(req.query.user_id);

        const subscription = await SubscriptionSchema.findOne({ user_id: req.query.user_id })
            .populate({
                path: 'channel_id',
                select: 'channel_name _id phone email img'
            })
            .populate({
                path: 'plan_id',
                select: 'name price'
            })
            .lean(); // Convert to plain JS object

        if (!subscription) {
            return res.status(200).json({ 
                message: "Subscription not found",
                data: []

             });
        }

        res.status(200).json({
            message: "Subscription fetched successfully",
            data: [subscription]
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching subscription",
            error: error.message
        });
    }
};


// Update subscription by ID
exports.updateSubscription = async (req, res) => {
    try {
        const updatedSubscription = await SubscriptionSchema.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedSubscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        res.status(200).json({ message: "Subscription updated successfully", data: updatedSubscription });
    } catch (error) {
        res.status(500).json({ message: "Error updating subscription", error: error.message });
    }
};

// Delete subscription by ID
exports.deleteSubscription = async (req, res) => {
    try {
        const deletedSubscription = await SubscriptionSchema.findByIdAndDelete(req.params.id);
        if (!deletedSubscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        res.status(200).json({ message: "Subscription deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting subscription", error: error.message });
    }
};
