const express = require("express");
const router = express.Router();
const { getUserSubscriptionStatus } = require("../../controllers/api/subscription.controller");

router.get("/check_user_subscription_status", getUserSubscriptionStatus);

module.exports = router;
