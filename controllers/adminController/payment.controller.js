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
            video_id,    // Added video_id
            country, 
            price_amount, 
            paid_amount, 
            custom_duration
        } = req.body;

        // 1. Create Razorpay Order
        const razorpayOrder = await createRazorpayOrder(ammount, currencyCode);
        console.log(razorpayOrder);

        const currentTimestamp = Date.now();
        let validityPeriod;

        // 2. Validity Period calculation
        if (!plan_id) {
            // Single Video — 45 days validity
            if (!video_id) {
                return res.status(400).json({ message: "Missing video_id for single video purchase" });
            }

            // Check if the user already has an active subscription for the same video
            const existingSingleVideo = await SubscriptionSchema.findOne({
                user_id,
                channel_id,
                video_id,
                status: 1, // Active status
                timestamp_to: { $gt: Date.now() } // Valid until future
            });

            if (existingSingleVideo) {
                return res.status(400).json({
                    message: "User already purchased this video",
                    subscription: existingSingleVideo
                });
            }

            validityPeriod = 45 * 24 * 60 * 60 * 1000; // Single video validity — 45 days
        } else {
            
            const plan = await planSchema.findById(plan_id);

            if (!plan) {
                return res.status(400).json({ message: "Invalid plan_id" });
            }
            
            if (plan.type === "custom" && plan.day || custom_duration) {
                validityPeriod = plan.day || custom_duration * 24 * 60 * 60 * 1000;
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
                        validityPeriod = 30 * 24 * 60 * 60 * 1000; // Fallback (monthly)
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
            video_id, // Save the video_id
            price_amount,
            paid_amount,
            timestamp_from,
            timestamp_to,
            payment_method: "Razorpay", // Static or dynamic as per your use case
            payment_info: JSON.stringify(razorpayOrder), // Save full Razorpay order details
            payment_timestamp: currentTimestamp,
            receipt: razorpayOrder.receipt, // From Razorpay response
            razorpay_order_id: razorpayOrder.id, // From Razorpay response
            currency: razorpayOrder.currency,
            amount: razorpayOrder.amount,
            amount_due: razorpayOrder.amount_due,
            amount_paid: razorpayOrder.amount_paid,
            created_at: razorpayOrder.created_at,
            status: "active" // Subscription status
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
        const subscription = await SubscriptionSchema.findById(req.params.id);
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }
        res.status(200).json({ message: "Subscription fetched successfully", data: subscription });
    } catch (error) {
        res.status(500).json({ message: "Error fetching subscription", error: error.message });
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
