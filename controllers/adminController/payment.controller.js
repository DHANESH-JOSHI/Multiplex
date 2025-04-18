const axios = require("axios");
const { createRazorpayOrder } = require('../../services/razorpayService');
const SubscriptionSchema = require('../../models/subscription.model');

// Create Razorpay order and save subscription
exports.addSubscription = async (req, res) => {
    try {
        const { plan_id, user_id, ammount, currencyCode, country } = req.body;

        // 1. Create Razorpay Order
        const razorpayOrder = await createRazorpayOrder(ammount, currencyCode);

        // 2. Save subscription with order ID
        const newSubscription = new SubscriptionSchema({
            plan_id,
            user_id,
            ammount,
            currencyCode,
            country,
            razorpay_order_id: razorpayOrder.id // Add this field in your schema if not already
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
