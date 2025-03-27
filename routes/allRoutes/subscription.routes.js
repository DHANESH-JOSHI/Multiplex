const express = require("express");
const router = express.Router();
const { getUserSubscriptionStatus } = require("../../controllers/api/subscription.controller");

router.get("/", getUserSubscriptionStatus);

module.exports = router;
