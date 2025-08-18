const { 
  createRazorpayOrder, 
  verifyRazorpayPayment, 
  captureRazorpayPayment,
  getPaymentDetails 
} = require('./razorpayService');
const SubscriptionSchema = require('../models/subscription.model');
const planSchema = require('../models/plan.model');
const { v4: uuidv4 } = require('uuid');

/**
 * Enhanced Payment Service with Automatic Capture
 * Implements 4 business cases:
 * 1. Paid Plan (plan_id) - Razorpay capture
 * 2. Paid Single Video (video_id) - Razorpay capture  
 * 3. Free Content (price_amount = 0) - No payment
 * 4. Cash Payment (manual) - Admin controlled
 */

class EnhancedPaymentService {
  
  /**
   * Generate correlation ID for tracking
   */
  generateCorrelationId() {
    return `pay_${Date.now()}_${uuidv4().substr(0, 8)}`;
  }

  /**
   * Log with correlation ID
   */
  log(correlationId, level, message, data = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] [${correlationId}] ${message}`, data);
  }

  /**
   * Case 1 & 2: Process Razorpay Payment (Plan or Single Video)
   * Automatically captures payment after verification
   */
  async processRazorpayPayment(paymentData) {
    const correlationId = this.generateCorrelationId();
    const { 
      user_id, 
      plan_id = null, 
      video_id = null, 
      channel_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      price_amount,
      paid_amount,
      currencyCode = 'INR'
    } = paymentData;

    this.log(correlationId, 'info', 'Starting Razorpay payment processing', { 
      plan_id, video_id, channel_id, user_id, razorpay_order_id 
    });

    try {
      // Step 1: Find existing subscription record by order_id
      const existingSubscription = await SubscriptionSchema.findOne({
        razorpay_order_id
      });

      if (!existingSubscription) {
        this.log(correlationId, 'error', 'Subscription not found for order_id', { razorpay_order_id });
        throw new Error('Subscription record not found for this order_id');
      }

      // Step 2: Check if already processed (idempotency)
      if (existingSubscription.ispayment === 1 && existingSubscription.status === 1) {
        this.log(correlationId, 'warn', 'Payment already processed', { razorpay_order_id });
        return {
          success: true,
          message: 'Payment already processed',
          subscription: existingSubscription,
          alreadyProcessed: true
        };
      }

      // Step 3: Verify payment signature
      this.log(correlationId, 'info', 'Verifying payment signature');
      const isValidSignature = verifyRazorpayPayment(razorpay_payment_id, razorpay_order_id, razorpay_signature);
      
      if (!isValidSignature) {
        this.log(correlationId, 'error', 'Invalid payment signature');
        
        // Update subscription as failed
        await SubscriptionSchema.findOneAndUpdate(
          { razorpay_order_id },
          {
            $set: {
              'payment_info.0.razorpay_payment_id': razorpay_payment_id,
              'payment_info.0.razorpay_signature': razorpay_signature,
              'payment_info.0.status': 'failed',
              status: 0,
              ispayment: 0,
              is_active: false
            }
          }
        );
        
        throw new Error('Invalid payment signature');
      }

      // Step 4: Get payment details from Razorpay
      this.log(correlationId, 'info', 'Fetching payment details from Razorpay');
      const paymentDetailsResult = await getPaymentDetails(razorpay_payment_id);
      
      if (!paymentDetailsResult.success) {
        throw new Error('Failed to fetch payment details from Razorpay');
      }

      const paymentDetails = paymentDetailsResult.payment;
      this.log(correlationId, 'info', 'Payment details fetched', { 
        payment_id: paymentDetails.id,
        status: paymentDetails.status,
        captured: paymentDetails.captured
      });

      // Step 5: Capture payment if not already captured
      let captureResult = null;
      if (!paymentDetails.captured && paymentDetails.status === 'authorized') {
        this.log(correlationId, 'info', 'Capturing payment', { 
          payment_id: razorpay_payment_id, 
          amount: paymentDetails.amount 
        });
        
        try {
          captureResult = await captureRazorpayPayment(razorpay_payment_id, paymentDetails.amount);
          this.log(correlationId, 'info', 'Payment captured successfully');
        } catch (captureError) {
          this.log(correlationId, 'error', 'Payment capture failed', { error: captureError.message });
          
          // Update subscription as failed
          await SubscriptionSchema.findOneAndUpdate(
            { razorpay_order_id },
            {
              $set: {
                'payment_info.0.razorpay_payment_id': razorpay_payment_id,
                'payment_info.0.razorpay_signature': razorpay_signature,
                'payment_info.0.status': 'failed',
                status: 0,
                ispayment: 0,
                is_active: false
              }
            }
          );
          
          throw new Error(`Payment capture failed: ${captureError.message}`);
        }
      } else if (paymentDetails.captured) {
        this.log(correlationId, 'info', 'Payment already captured');
      } else {
        throw new Error(`Payment in invalid state: ${paymentDetails.status}`);
      }

      // Step 6: Update subscription as successful
      this.log(correlationId, 'info', 'Updating subscription as paid');
      const updatedSubscription = await SubscriptionSchema.findOneAndUpdate(
        { razorpay_order_id },
        {
          $set: {
            'payment_info.0.razorpay_payment_id': razorpay_payment_id,
            'payment_info.0.razorpay_signature': razorpay_signature,
            'payment_info.0.status': 'paid',
            status: 1,
            ispayment: 1,
            is_active: true,
            amount_paid: paymentDetails.amount
          }
        },
        { new: true }
      );

      this.log(correlationId, 'info', 'Payment processing completed successfully');

      return {
        success: true,
        message: 'Payment captured and subscription activated successfully',
        subscription: updatedSubscription,
        paymentDetails,
        captureResult,
        correlationId
      };

    } catch (error) {
      this.log(correlationId, 'error', 'Payment processing failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Case 3: Handle Free Content
   */
  async processFreeContent(contentData) {
    const correlationId = this.generateCorrelationId();
    const {
      user_id,
      channel_id,
      video_id = null,
      plan_id = null,
      custom_duration = null
    } = contentData;

    this.log(correlationId, 'info', 'Processing free content access', { 
      user_id, channel_id, video_id, plan_id 
    });

    try {
      const currentTimestamp = Date.now();
      
      // Determine validity period
      let validityPeriod;
      if (plan_id) {
        const plan = await planSchema.findById(plan_id);
        if (!plan) {
          throw new Error('Plan not found');
        }
        
        if (custom_duration) {
          validityPeriod = custom_duration * 24 * 60 * 60 * 1000;
        } else {
          switch (plan.type) {
            case "monthly": validityPeriod = 30 * 24 * 60 * 60 * 1000; break;
            case "quarterly": validityPeriod = 90 * 24 * 60 * 60 * 1000; break;
            case "yearly": validityPeriod = 365 * 24 * 60 * 60 * 1000; break;
            default: validityPeriod = 30 * 24 * 60 * 60 * 1000;
          }
        }
      } else if (video_id) {
        validityPeriod = 48 * 60 * 60 * 1000; // 48 hours for single video
      } else {
        throw new Error('Either plan_id or video_id is required');
      }

      // Create free subscription
      const freeSubscription = new SubscriptionSchema({
        user_id,
        plan_id,
        channel_id,
        video_id,
        price_amount: 0,
        paid_amount: 0,
        timestamp_from: currentTimestamp,
        timestamp_to: currentTimestamp + validityPeriod,
        payment_method: "FREE",
        payment_info: [],
        recurring: 0,
        status: 1,
        ispayment: 0,
        is_active: true,
        receipt: "Free",
        currency: "INR",
        amount: 0,
        amount_due: 0,
        amount_paid: 0,
        created_at: currentTimestamp
      });

      const savedSubscription = await freeSubscription.save();

      this.log(correlationId, 'info', 'Free content access granted', { 
        subscription_id: savedSubscription._id 
      });

      return {
        success: true,
        message: 'Free content access granted successfully',
        subscription: savedSubscription,
        correlationId
      };

    } catch (error) {
      this.log(correlationId, 'error', 'Free content processing failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Case 4: Handle Cash Payment (Manual by Admin)
   */
  async processCashPayment(cashData) {
    const correlationId = this.generateCorrelationId();
    const {
      user_id,
      channel_id,
      video_id = null,
      plan_id = null,
      price_amount,
      paid_amount,
      custom_duration,
      admin_note = null
    } = cashData;

    this.log(correlationId, 'info', 'Processing cash payment', { 
      user_id, channel_id, video_id, plan_id, custom_duration 
    });

    try {
      const currentTimestamp = Date.now();
      const validityPeriod = custom_duration * 24 * 60 * 60 * 1000;

      const cashSubscription = new SubscriptionSchema({
        user_id,
        plan_id,
        channel_id,
        video_id,
        price_amount,
        paid_amount,
        timestamp_from: currentTimestamp,
        timestamp_to: currentTimestamp + validityPeriod,
        payment_method: "CASH",
        payment_info: admin_note ? [{ method: "cash", verified_by_admin: true, note: admin_note }] : [],
        recurring: 0,
        status: 1,
        ispayment: 1,
        is_active: true,
        receipt: `CASH_${correlationId}`,
        currency: "INR",
        amount: paid_amount,
        amount_due: 0,
        amount_paid: paid_amount,
        created_at: currentTimestamp
      });

      const savedSubscription = await cashSubscription.save();

      this.log(correlationId, 'info', 'Cash payment processed successfully', { 
        subscription_id: savedSubscription._id 
      });

      return {
        success: true,
        message: 'Cash payment processed successfully',
        subscription: savedSubscription,
        correlationId
      };

    } catch (error) {
      this.log(correlationId, 'error', 'Cash payment processing failed', { error: error.message });
      throw error;
    }
  }
}

module.exports = new EnhancedPaymentService();
