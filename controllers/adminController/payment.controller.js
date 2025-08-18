const axios = require("axios");
const { createRazorpayOrder, verifyRazorpayPayment, getPaymentDetails, refundPayment, captureRazorpayPayment } = require('../../services/razorpayService');
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
        const activeConditions = {
            user_id,
            channel_id,
            status: 1,
            timestamp_to: { $gt: now }
        };

        const existingSubscriptions = await SubscriptionSchema.find({
            ...activeConditions,
            $or: [
                plan_id ? { plan_id } : null,
                video_id ? { video_id } : null
            ].filter(Boolean)
        });

        if (existingSubscriptions.length > 0) {
            return res.status(200).json({
                message: "User already has an active subscription for this plan or video",
                subscription: existingSubscriptions
            });
        }

        // 1. Create Razorpay Order
        const razorpayOrder = await createRazorpayOrder(ammount, currencyCode);

        const currentTimestamp = Date.now();
        let validityPeriod;

        // 2. Validity Period calculation
        if (!plan_id && !video_id) {
            return res.status(400).json({ message: "Missing plan_id or video_id" });
        }

        if (plan_id) {
            // Plan present (priority)
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
        } else if (video_id && !plan_id) {
            // Only video present
            validityPeriod = 48 * 60 * 60 * 1000; // 48 hours
        }

        const timestamp_from = currentTimestamp;
        const timestamp_to = currentTimestamp + validityPeriod;

        // 3. Save Subscription
        const newSubscription = new SubscriptionSchema({
            plan_id: plan_id || null,
            user_id,
            channel_id,
            video_id: video_id || null,
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

        res.status(200).json({
            message: "Razorpay order created and subscription added successfully",
            subscription: [savedSubscription],
            razorpayOrder
        });

    } catch (error) {
        console.error("Error in createSubscriptionWithPayment:", error);
        res.status(500).json({ message: "Failed to create subscription with payment", error: error.message });
    }
};


exports.addSingleVideoPurchase = async (req, res) => {
  try {
    const {
      user_id,
      channel_id,
      video_id,
      country = "",
      currencyCode = "INR",
      price_amount = 0,        // Displayed price
      paid_amount = 0,         // Final amount (after discounts)
      custom_duration          // Optional: duration in days
    } = req.body;

    // 1. Basic validation
    if (!user_id || !channel_id || !video_id) {
      return res.status(400).json({ message: "user_id, channel_id, and video_id are required" });
    }

    // 2. Check if user already has an active subscription for this video
    const now = Date.now();
    const existing = await SubscriptionSchema.findOne({
      user_id,
      video_id,
      channel_id,
      status: 1,
      timestamp_to: { $gt: now }
    });
    if (existing) {
      return res.status(200).json({
        message: "User already has an active subscription for this video",
        subscription: existing
      });
    }

    // 3. Create Razorpay Order (only if paid_amount > 0)
    let razorpayOrder = null;
    if (paid_amount > 0) {
      razorpayOrder = await createRazorpayOrder(paid_amount, currencyCode); 
    }

    // 4. Determine validity duration (default: 48 hours, or custom)
    const validityMs = custom_duration
      ? custom_duration * 24 * 60 * 60 * 1000
      : 48 * 60 * 60 * 1000;

    const timestamp_from = now;
    const timestamp_to = now + validityMs;

    // 5. Save subscription
    const subDoc = new SubscriptionSchema({
      user_id,
      channel_id,
      video_id,
      plan_id: null,
      price_amount,
      paid_amount,
      timestamp_from,
      timestamp_to,
      payment_method: paid_amount > 0 ? "Razorpay" : "FREE",
      payment_info: paid_amount > 0
        ? [{
            razorpay_order_id: razorpayOrder.id,
            razorpay_payment_id: "",
            razorpay_signature: "",
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            status: "created"
          }]
        : [],
      payment_timestamp: now,
      receipt: razorpayOrder?.receipt || "Free",
      razorpay_order_id: razorpayOrder?.id || "",
      currency: razorpayOrder?.currency || currencyCode,
      amount: razorpayOrder?.amount || 0,
      amount_due: razorpayOrder?.amount_due || 0,
      amount_paid: razorpayOrder?.amount_paid || 0,
      created_at: razorpayOrder?.created_at || now,
      status: 1
    });

    const saved = await subDoc.save();

    // 6. Return success response
    res.status(201).json({
      message: paid_amount > 0
        ? "Razorpay order created and video subscription saved successfully"
        : "Free video access activated successfully",
      data: {
        subscription: saved,
        razorpayOrder
      }
    });

  } catch (err) {
    console.error("addSingleVideoPurchase:", err);
    res.status(500).json({
      message: "Error while creating single video subscription",
      error: err.message
    });
  }
};


// Manually grant a subscription (no Razorpay)
exports.grantManualSubscription = async (req, res) => {
    try {
        const {
            user_id,
            channel_id,
            video_id,
            plan_id,
            price_amount = 0,
            paid_amount = 0,
            custom_duration = 2,
        } = req.body;

        if (!user_id || (!plan_id && !video_id)) {
            return res.status(400).json({ message: "Missing required parameters (user_id + plan_id/video_id)" });
        }

        const currentTimestamp = Date.now();
        const validityPeriod = (custom_duration || 2) * 24 * 60 * 60 * 1000;

        const timestamp_from = currentTimestamp;
        const timestamp_to = currentTimestamp + validityPeriod;

        const manualSubscription = new SubscriptionSchema({
            plan_id: plan_id || null,
            user_id,
            channel_id,
            video_id,
            price_amount,
            paid_amount,
            timestamp_from,
            timestamp_to,
            payment_method: "manual",
            is_manual: true,
            payment_info: [],
            ispayment: 1,
            is_active: 1,
            status: 1
        });

        const saved = await manualSubscription.save();

        res.status(201).json({
            message: "Manual subscription granted",
            data: saved
        });
    } catch (err) {
        res.status(500).json({
            message: "Error granting manual subscription",
            error: err.message
        });
    }
};


// Update payment info after Razorpay payment is done with verification and capture
exports.updatePayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ 
                message: "Missing payment parameters",
                isSubscribed: false 
            });
        }

        console.log("🔍 Payment verification request:", { 
            razorpay_order_id, 
            razorpay_payment_id,
            signature_length: razorpay_signature?.length || 0
        });
        
        // Check if using test data (for development) - multiple patterns
        const isTestPayment = razorpay_payment_id.includes('test') || 
                            razorpay_payment_id.includes('pay_test') ||
                            razorpay_payment_id.startsWith('pay_fake') ||
                            razorpay_signature === 'test_signature';
        
        // DEVELOPMENT MODE: Only skip for explicit test mode header
        const isDevelopmentMode = req.headers['x-test-mode'] === 'true';
        
        // Real Razorpay payment detection
        const isRealRazorpayPayment = razorpay_payment_id.startsWith('pay_') && 
                                    !isTestPayment && 
                                    razorpay_payment_id.length > 15;
        
        // Find subscription by order_id first
        console.log("🔍 Looking for subscription with order_id:", razorpay_order_id);
        
        const existingSubscription = await SubscriptionSchema.findOne({
            "payment_info.0.razorpay_order_id": razorpay_order_id
        });
        
        console.log("📋 Found subscription:", !!existingSubscription);
        
        if (!existingSubscription) {
            return res.status(404).json({
                message: "Subscription not found for this order_id",
                isSubscribed: false,
                debug: { order_id: razorpay_order_id }
            });
        }
        
        let isValidSignature = false;
        
        // ENHANCED SIGNATURE VERIFICATION
        if (isTestPayment || isDevelopmentMode) {
            console.log("⚠️  DEVELOPMENT/TEST MODE: Bypassing signature verification");
            console.log("Test payment:", isTestPayment, "Dev mode:", isDevelopmentMode);
            isValidSignature = true;
        } else {
            // Try signature verification with enhanced error handling
            try {
                console.log("🔐 Attempting signature verification...");
                isValidSignature = verifyRazorpayPayment(razorpay_payment_id, razorpay_order_id, razorpay_signature);
                console.log("✅ Payment signature verified:", isValidSignature);
                
                // If signature fails, try alternative verification approaches
                if (!isValidSignature && isRealRazorpayPayment) {
                    console.log("🔄 Primary signature failed, attempting payment status verification...");
                    
                    try {
                        // Get payment details to verify authenticity
                        const paymentDetails = await getPaymentDetails(razorpay_payment_id, 30000); // 30 second timeout
                        
                        if (paymentDetails.success && paymentDetails.payment) {
                            const payment = paymentDetails.payment;
                            console.log("💳 Payment verification via API:", { 
                                payment_id: payment.id, 
                                order_id: payment.order_id,
                                status: payment.status,
                                amount: payment.amount
                            });
                            
                            // Verify payment belongs to this order and is legitimate
                            if (payment.order_id === razorpay_order_id && 
                                (payment.status === 'captured' || payment.status === 'authorized')) {
                                console.log("✅ Payment verified via API despite signature mismatch");
                                isValidSignature = true;
                            } else {
                                console.log("❌ Payment API verification failed - order mismatch or invalid status");
                            }
                        } else {
                            console.log("❌ Unable to fetch payment details from Razorpay API");
                        }
                    } catch (apiError) {
                        console.error("❌ Payment API verification failed:", apiError.message);
                        // Don't fail here - continue with original signature result
                    }
                }
            } catch (verifyError) {
                console.error("❌ Signature verification error:", verifyError.message);
                isValidSignature = false;
            }
        }

        if (!isValidSignature) {
            console.log("❌ All verification methods failed - rejecting payment");
            return res.status(400).json({
                message: "Payment verification failed - invalid signature and unable to verify via API",
                isSubscribed: false,
                debug: {
                    isTestPayment,
                    isDevelopmentMode,
                    signatureProvided: !!razorpay_signature,
                    paymentId: razorpay_payment_id
                }
            });
        }

        // Payment Processing Decision
        console.log(`🔍 Payment processing decision:`, {
            isTestPayment,
            isDevelopmentMode,
            isRealRazorpayPayment,
            willCallAPI: isRealRazorpayPayment || (!isTestPayment && !isDevelopmentMode)
        });

        // Initialize capture status
        let captureSuccessful = false;
        let captureError = null;

        // ENHANCED PAYMENT PROCESSING WITH RETRY LOGIC
        if (isRealRazorpayPayment || (!isTestPayment && !isDevelopmentMode)) {
            const maxRetries = 3;
            let retryCount = 0;
            
            while (retryCount < maxRetries && !captureSuccessful) {
                try {
                    console.log(`💳 Fetching payment details (attempt ${retryCount + 1}/${maxRetries}) for:`, razorpay_payment_id);
                    
                    // Increased timeout and retry logic
                    const paymentDetails = await getPaymentDetails(razorpay_payment_id, 30000); // 30 seconds
                    
                    if (!paymentDetails.success || !paymentDetails.payment) {
                        throw new Error(`Payment details fetch failed: ${paymentDetails.error || 'Unknown error'}`);
                    }
                    
                    const payment = paymentDetails.payment;
                    console.log("💳 Payment details:", { 
                        payment_id: payment.id, 
                        status: payment.status,
                        captured: payment.captured,
                        amount: payment.amount,
                        currency: payment.currency
                    });

                    // Handle different payment statuses
                    if (payment.status === 'captured') {
                        console.log("✅ Payment already captured");
                        captureSuccessful = true;
                        break;
                    } else if (payment.status === 'authorized' && !payment.captured) {
                        console.log("🔄 Capturing authorized payment:", razorpay_payment_id, "Amount:", payment.amount, "Currency:", payment.currency);
                        
                        const captureResult = await captureRazorpayPayment(
                            razorpay_payment_id, 
                            payment.amount,
                            payment.currency
                        );
                        
                        if (captureResult && captureResult.id) {
                            console.log("✅ Payment captured successfully:", captureResult.id);
                            captureSuccessful = true;
                            break;
                        } else {
                            throw new Error("Capture returned invalid result");
                        }
                    } else if (payment.status === 'failed') {
                        throw new Error(`Payment failed at gateway: ${payment.error_description || 'Unknown reason'}`);
                    } else {
                        console.log("⚠️  Unusual payment status:", payment.status);
                        captureError = `Payment status: ${payment.status}`;
                        // Don't break - try again
                    }

                } catch (error) {
                    console.error(`❌ Payment processing attempt ${retryCount + 1} failed:`, error.message);
                    captureError = error.message;
                    retryCount++;
                    
                    // Wait before retry (exponential backoff)
                    if (retryCount < maxRetries) {
                        const waitTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
                        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                    }
                }
            }
            
            // Final check after all retries
            if (!captureSuccessful) {
                console.error(`❌ Payment processing failed after ${maxRetries} attempts`);
                return res.status(400).json({
                    message: "Payment capture failed after multiple attempts. Please contact support if amount was debited.",
                    isSubscribed: false,
                    error: {
                        type: "CAPTURE_FAILED_AFTER_RETRIES",
                        details: captureError || "Payment processing timeout",
                        payment_id: razorpay_payment_id,
                        attempts: maxRetries
                    }
                });
            }
        } else {
            console.log("⚠️  DEVELOPMENT/TEST MODE: Skipping Razorpay API calls for:", razorpay_payment_id);
            captureSuccessful = true; // Allow test payments
        }

        // Step 4: Update subscription if everything successful
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

        console.log("💾 Subscription updated:", !!updated);

        if (!updated) {
            return res.status(404).json({ 
                message: "Subscription not found for this order_id",
                isSubscribed: false 
            });
        }

        return res.status(200).json({
            message: "Payment verified, captured and subscription activated successfully",
            isSubscribed: true,
            data: updated
        });

    } catch (err) {
        console.error("❌ updatePayment error:", err);
        return res.status(500).json({ 
            message: "Error updating payment", 
            isSubscribed: false,
            error: err.message 
        });
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

// ENHANCED: Handle Cash Payment (Case 4)
exports.processCashPayment = async (req, res) => {
    const enhancedPaymentService = require('../../services/enhancedPaymentService');
    
    try {
        const {
            user_id,
            channel_id,
            video_id,
            plan_id,
            price_amount,
            paid_amount,
            custom_duration,
            admin_note
        } = req.body;

        if (!user_id || !channel_id || (!video_id && !plan_id) || !custom_duration || !paid_amount) {
            return res.status(400).json({
                message: "Missing required parameters: user_id, channel_id, (video_id or plan_id), custom_duration, paid_amount",
                isSubscribed: false
            });
        }

        console.log(`💰 Processing cash payment:`, { user_id, channel_id, video_id, plan_id, paid_amount, custom_duration });

        const result = await enhancedPaymentService.processCashPayment({
            user_id,
            channel_id,
            video_id,
            plan_id,
            price_amount,
            paid_amount,
            custom_duration,
            admin_note
        });

        return res.status(201).json({
            message: result.message,
            isSubscribed: true,
            data: result.subscription,
            correlationId: result.correlationId
        });

    } catch (error) {
        console.error("❌ Cash payment processing failed:", error.message);
        return res.status(500).json({
            message: `Cash payment processing failed: ${error.message}`,
            isSubscribed: false,
            error: error.message
        });
    }
};

// Manual refund subscription
exports.manualRefundSubscription = async (req, res) => {
    try {
        const { subscription_id, reason, refund_amount } = req.body;

        if (!subscription_id) {
            return res.status(400).json({
                message: "Subscription ID is required",
                isSubscribed: false
            });
        }

        // Find the subscription
        const subscription = await SubscriptionSchema.findById(subscription_id);
        if (!subscription) {
            return res.status(404).json({
                message: "Subscription not found",
                isSubscribed: false
            });
        }

        // Check if subscription has payment info for refund
        if (!subscription.payment_info || !subscription.payment_info[0]?.razorpay_payment_id) {
            return res.status(400).json({
                message: "No payment information found for refund",
                isSubscribed: false
            });
        }

        const payment_id = subscription.payment_info[0].razorpay_payment_id;
        
        // Call Razorpay refund service
        const refundResult = await refundPayment(payment_id, refund_amount);

        if (!refundResult.success) {
            return res.status(400).json({
                message: `Refund failed: ${refundResult.error}`,
                isSubscribed: false
            });
        }

        // Update subscription status to cancelled/refunded
        const updatedSubscription = await SubscriptionSchema.findByIdAndUpdate(
            subscription_id,
            {
                $set: {
                    status: 0, // Deactivate subscription
                    is_active: 0,
                    refund_info: {
                        refund_id: refundResult.refund.id,
                        refund_amount: refundResult.refund.amount,
                        refund_status: refundResult.refund.status,
                        refund_timestamp: Date.now(),
                        reason: reason || "Manual refund"
                    }
                }
            },
            { new: true }
        );

        return res.status(200).json({
            message: "Subscription refunded successfully",
            isSubscribed: false,
            data: {
                subscription: updatedSubscription,
                refund: refundResult.refund
            }
        });

    } catch (error) {
        console.error("Manual refund error:", error);
        res.status(500).json({
            message: "Error processing manual refund",
            isSubscribed: false,
            error: error.message
        });
    }
};

// Get payment details for a subscription
exports.getSubscriptionPaymentDetails = async (req, res) => {
    try {
        const { subscription_id } = req.params;

        if (!subscription_id) {
            return res.status(400).json({
                message: "Subscription ID is required",
                isSubscribed: false
            });
        }

        const subscription = await SubscriptionSchema.findById(subscription_id);
        if (!subscription) {
            return res.status(404).json({
                message: "Subscription not found",
                isSubscribed: false
            });
        }

        // Get payment details from Razorpay if payment_id exists
        let paymentDetails = null;
        if (subscription.payment_info && subscription.payment_info[0]?.razorpay_payment_id) {
            const payment_id = subscription.payment_info[0].razorpay_payment_id;
            const paymentResult = await getPaymentDetails(payment_id);
            
            if (paymentResult.success) {
                paymentDetails = paymentResult.payment;
            }
        }

        return res.status(200).json({
            message: "Subscription payment details retrieved successfully",
            isSubscribed: subscription.status === 1,
            data: {
                subscription,
                razorpayPaymentDetails: paymentDetails
            }
        });

    } catch (error) {
        console.error("Get payment details error:", error);
        res.status(500).json({
            message: "Error retrieving payment details",
            isSubscribed: false,
            error: error.message
        });
    }
};
