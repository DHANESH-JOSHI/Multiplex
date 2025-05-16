const express = require("express");
const router = express.Router();
const { addSubscription, updatePayment, getAllSubscriptions, getSubscriptionById, updateSubscription, deleteSubscription } = require("../../controllers/adminController/payment.controller");

router.post("/", addSubscription);
router.post("/receipt", updatePayment)
router.get("/", getAllSubscriptions);
router.get("/check_user_subscription", getSubscriptionById);
router.put("/:id", updateSubscription);
router.delete("/:id", deleteSubscription);

module.exports = router;
