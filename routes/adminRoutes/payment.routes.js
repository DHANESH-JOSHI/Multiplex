const express = require("express");
const router = express.Router();
const { addSubscription,
        updatePayment,
        getAllSubscriptions,
        getSubscriptionById,
        updateSubscription,
        deleteSubscription,
        checkVideoSubscription,
        grantManualSubscription,
        addSingleVideoPurchase,
        processFreeContent,
        processCashPayment,
        manualRefundSubscription,
        getSubscriptionPaymentDetails
         } = require("../../controllers/adminController/payment.controller");
const { directCapturePayment } = require("../../controllers/adminController/directCapture.controller");

// Existing routes
router.post("/", addSubscription);
router.post("/single", addSingleVideoPurchase);
router.post("/manual", grantManualSubscription);
router.post("/receipt", updatePayment); // ENHANCED: Now with automatic capture
router.get("/", getAllSubscriptions);
router.get("/check_user_subscription", getSubscriptionById);
router.get("/check_video_subscription", checkVideoSubscription);
router.put("/:id", updateSubscription);
router.delete("/:id", deleteSubscription);

// NEW ENHANCED ROUTES for 4 Business Cases
router.post("/free", processFreeContent);        // Case 3: Free Content
router.post("/cash", processCashPayment);        // Case 4: Cash Payment
router.post("/refund", manualRefundSubscription); // Enhanced refund
router.get("/details/:subscription_id", getSubscriptionPaymentDetails); // Payment details

// DIRECT CAPTURE API - Replace receipt API
router.post("/capture", directCapturePayment);   // Direct Razorpay capture API

module.exports = router;