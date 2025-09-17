const express = require("express");
const router = express.Router();
const {
  addSubscription,
  addInAppSubscription,
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
  getSubscriptionPaymentDetails,
} = require("../../controllers/adminController/payment.controller");
const {
  directCapturePayment,
} = require("../../controllers/adminController/directCapture.controller");

router.post("/", addSubscription);
router.post("/single", addSingleVideoPurchase);
router.post("/manual", grantManualSubscription);
router.post("/in-app", addInAppSubscription);
router.post("/receipt", updatePayment);
router.get("/", getAllSubscriptions);
router.get("/check_user_subscription", getSubscriptionById);
router.get("/check_video_subscription", checkVideoSubscription);
router.put("/:id", updateSubscription);
router.delete("/:id", deleteSubscription);

router.post("/free", processFreeContent);
router.post("/cash", processCashPayment);
router.post("/refund", manualRefundSubscription);
router.get("/details/:subscription_id", getSubscriptionPaymentDetails);

router.post("/capture", directCapturePayment); // Direct Razorpay capture API

module.exports = router;
