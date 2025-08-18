const { captureRazorpayPayment, verifyRazorpayPayment } = require('../../services/razorpayService');
const SubscriptionSchema = require('../../models/subscription.model');

// Direct Razorpay Capture API endpoint
exports.directCapturePayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency } = req.body;
        
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ 
                message: "Missing payment parameters",
                isSubscribed: false 
            });
        }

        console.log("🔍 Direct capture request:", { 
            razorpay_order_id, 
            razorpay_payment_id,
            amount,
            currency: currency || 'INR'
        });
        
        // Step 1: Verify signature first
        const isValidSignature = verifyRazorpayPayment(razorpay_payment_id, razorpay_order_id, razorpay_signature);
        console.log("✅ Signature verified:", isValidSignature);
        
        if (!isValidSignature) {
            return res.status(400).json({
                message: "Invalid payment signature",
                isSubscribed: false
            });
        }

        // Step 2: Find subscription
        const existingSubscription = await SubscriptionSchema.findOne({
            "payment_info.0.razorpay_order_id": razorpay_order_id
        });
        
        if (!existingSubscription) {
            return res.status(404).json({
                message: "Subscription not found for this order_id",
                isSubscribed: false
            });
        }

        // Step 3: Direct capture using provided amount or subscription amount
        const captureAmount = amount || existingSubscription.payment_info[0]?.amount || existingSubscription.amount;
        const captureCurrency = currency || existingSubscription.payment_info[0]?.currency || 'INR';
        
        console.log(`💳 Capturing payment:`, { payment_id: razorpay_payment_id, amount: captureAmount, currency: captureCurrency });
        
        try {
            const captureResult = await captureRazorpayPayment(razorpay_payment_id, captureAmount, captureCurrency);
            console.log("✅ Capture successful:", captureResult.id);
            
            // Step 4: Update subscription
            const updated = await SubscriptionSchema.findOneAndUpdate(
                { "payment_info.0.razorpay_order_id": razorpay_order_id },
                {
                    $set: {
                        "payment_info.0.razorpay_payment_id": razorpay_payment_id,
                        "payment_info.0.razorpay_signature": razorpay_signature,
                        "payment_info.0.status": "captured",
                        ispayment: 1,
                        is_active: 1,
                        status: 1,
                    }
                },
                { new: true }
            );

            return res.status(200).json({
                message: "Payment captured and subscription activated successfully",
                isSubscribed: true,
                data: {
                    subscription: updated,
                    capture: {
                        id: captureResult.id,
                        amount: captureResult.amount,
                        currency: captureResult.currency,
                        status: captureResult.status
                    }
                }
            });

        } catch (captureError) {
            console.error("❌ Capture failed:", captureError.message);
            return res.status(400).json({
                message: "Payment capture failed",
                isSubscribed: false,
                error: {
                    type: "CAPTURE_FAILED",
                    details: captureError.message,
                    payment_id: razorpay_payment_id
                }
            });
        }

    } catch (err) {
        console.error("❌ Direct capture error:", err);
        return res.status(500).json({ 
            message: "Error in direct capture", 
            isSubscribed: false,
            error: err.message 
        });
    }
};
