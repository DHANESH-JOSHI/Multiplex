# Enhanced Payment System - Test Examples

## Overview

This document provides test examples for the enhanced payment system that implements automatic Razorpay capture according to your business rules.

## Business Cases Implemented

### Case 1: Paid Plan (with plan_id)
- Razorpay integration with automatic capture
- Storage against plan_id + channel_id
- Payment method = "Razorpay"

### Case 2: Paid Single Video (with video_id, no plan_id)
- Razorpay integration with automatic capture
- Storage against video_id + channel_id
- Payment method = "Razorpay"

### Case 3: Free Content (price_amount = 0)
- No payment required
- Payment method = "FREE"
- Automatic activation

### Case 4: Cash Payment (manual, with custom duration)
- Admin-controlled payment
- Payment method = "CASH"
- Custom duration setting

---

## Test Examples

### 1. Case 1 - Paid Plan Subscription

#### Step 1: Create Razorpay Order (Existing endpoint)
```bash
POST /api/payment/
Content-Type: application/json

{
  "plan_id": "64a1234567890abcdef12345",
  "user_id": "64b9876543210fedcba09876", 
  "ammount": 99900,
  "currencyCode": "INR",
  "channel_id": "64c5555555555555555555555",
  "price_amount": 999,
  "paid_amount": 999
}
```

#### Step 2: Process Payment with Automatic Capture (Enhanced)
```bash
POST /api/payment/receipt
Content-Type: application/json

{
  "razorpay_order_id": "order_MhOjkHXxXbVB12",
  "razorpay_payment_id": "pay_MhOjkYNhgHvZz5",
  "razorpay_signature": "3b2186e7b8b6c3...signature...",
  "user_id": "64b9876543210fedcba09876",
  "plan_id": "64a1234567890abcdef12345",
  "channel_id": "64c5555555555555555555555",
  "price_amount": 999,
  "paid_amount": 999,
  "currencyCode": "INR"
}
```

**Expected Response:**
```json
{
  "message": "Payment captured and subscription activated successfully",
  "isSubscribed": true,
  "data": {
    "_id": "64d...",
    "user_id": "64b9876543210fedcba09876",
    "plan_id": "64a1234567890abcdef12345",
    "channel_id": "64c5555555555555555555555",
    "status": 1,
    "ispayment": 1,
    "payment_method": "Razorpay"
  },
  "paymentDetails": {
    "captured": true,
    "payment_id": "pay_MhOjkYNhgHvZz5",
    "amount": 99900,
    "currency": "INR",
    "status": "captured"
  },
  "correlationId": "pay_1702123456_abcd1234"
}
```

### 2. Case 2 - Paid Single Video Purchase

#### Step 1: Create Razorpay Order for Single Video
```bash
POST /api/payment/single
Content-Type: application/json

{
  "user_id": "64b9876543210fedcba09876",
  "channel_id": "64c5555555555555555555555",
  "video_id": "64e7777777777777777777777",
  "price_amount": 49,
  "paid_amount": 49,
  "currencyCode": "INR"
}
```

#### Step 2: Process Payment (Same enhanced endpoint)
```bash
POST /api/payment/receipt
Content-Type: application/json

{
  "razorpay_order_id": "order_VideoXYZ123",
  "razorpay_payment_id": "pay_VideoPayment456",
  "razorpay_signature": "video_signature_hash...",
  "user_id": "64b9876543210fedcba09876",
  "video_id": "64e7777777777777777777777",
  "channel_id": "64c5555555555555555555555",
  "price_amount": 49,
  "paid_amount": 49,
  "currencyCode": "INR"
}
```

### 3. Case 3 - Free Content Access (NEW)

```bash
POST /api/payment/free
Content-Type: application/json

{
  "user_id": "64b9876543210fedcba09876",
  "channel_id": "64c5555555555555555555555",
  "video_id": "64e7777777777777777777777"
}
```

**Expected Response:**
```json
{
  "message": "Free content access granted successfully",
  "isSubscribed": true,
  "data": {
    "_id": "64f...",
    "user_id": "64b9876543210fedcba09876",
    "video_id": "64e7777777777777777777777",
    "channel_id": "64c5555555555555555555555",
    "payment_method": "FREE",
    "price_amount": 0,
    "paid_amount": 0,
    "status": 1,
    "ispayment": 0,
    "receipt": "Free"
  },
  "correlationId": "pay_1702123456_free123"
}
```

### 4. Case 4 - Cash Payment (NEW)

```bash
POST /api/payment/cash
Content-Type: application/json

{
  "user_id": "64b9876543210fedcba09876",
  "channel_id": "64c5555555555555555555555",
  "plan_id": "64a1234567890abcdef12345",
  "price_amount": 999,
  "paid_amount": 999,
  "custom_duration": 30,
  "admin_note": "Cash payment received by admin John on 2024-01-15"
}
```

**Expected Response:**
```json
{
  "message": "Cash payment processed successfully", 
  "isSubscribed": true,
  "data": {
    "_id": "64g...",
    "user_id": "64b9876543210fedcba09876",
    "plan_id": "64a1234567890abcdef12345",
    "channel_id": "64c5555555555555555555555",
    "payment_method": "CASH",
    "price_amount": 999,
    "paid_amount": 999,
    "status": 1,
    "ispayment": 1,
    "payment_info": [{
      "method": "cash",
      "verified_by_admin": true,
      "note": "Cash payment received by admin John on 2024-01-15"
    }]
  },
  "correlationId": "pay_1702123456_cash789"
}
```

---

## Key Features Implemented

### ✅ Automatic Payment Capture
- **Before**: Manual capture required via Razorpay Dashboard
- **After**: Automatic capture on backend using Razorpay API

### ✅ Comprehensive Error Handling
- Invalid signature verification
- Failed payment capture
- Network timeouts
- Idempotency protection

### ✅ Correlation ID Tracking
- Every payment gets unique correlation ID
- Full audit trail in logs
- Easy debugging and tracking

### ✅ Idempotency Protection
- Prevents duplicate processing
- Safe for retry scenarios
- Maintains data consistency

### ✅ Enhanced Logging
```
[2024-01-15T10:30:45.123Z] [INFO] [pay_1702123456_abcd1234] Starting Razorpay payment processing {"plan_id":"64a...","channel_id":"64c..."}
[2024-01-15T10:30:45.234Z] [INFO] [pay_1702123456_abcd1234] Verifying payment signature
[2024-01-15T10:30:45.345Z] [INFO] [pay_1702123456_abcd1234] Fetching payment details from Razorpay  
[2024-01-15T10:30:45.456Z] [INFO] [pay_1702123456_abcd1234] Capturing payment {"payment_id":"pay_...","amount":99900}
[2024-01-15T10:30:45.567Z] [INFO] [pay_1702123456_abcd1234] Payment captured successfully
[2024-01-15T10:30:45.678Z] [INFO] [pay_1702123456_abcd1234] Updating subscription as paid
[2024-01-15T10:30:45.789Z] [INFO] [pay_1702123456_abcd1234] Payment processing completed successfully
```

---

## API Contract Compatibility 

✅ **All existing API endpoints remain unchanged**
✅ **All existing response formats maintained**  
✅ **All existing database fields preserved**
✅ **Frontend integration requires no changes**

Your existing frontend code will continue to work exactly the same, but now payments will be automatically captured on the backend instead of requiring manual intervention.

---

## Production Checklist

- [ ] Test with Razorpay test keys first
- [ ] Verify webhook endpoints if needed
- [ ] Test all error scenarios (network failures, invalid signatures)
- [ ] Monitor correlation IDs in production logs
- [ ] Set up alerts for failed payment captures
- [ ] Test idempotency with duplicate requests
- [ ] Verify refund functionality
- [ ] Test currency conversion if using multiple currencies

---

## Next Steps

1. Deploy this enhanced payment system to staging environment
2. Test all 4 business cases thoroughly
3. Monitor logs for correlation IDs and error patterns
4. Switch Razorpay keys from test to production
5. No more manual payment captures needed! 🎉
