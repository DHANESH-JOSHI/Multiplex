const express = require("express");
const router = express.Router();
const { getUserSubscriptionStatus } = require("../../controllers/mobileControllers/subscription.controller");

router.get("/", getUserSubscriptionStatus);

module.exports = router;
