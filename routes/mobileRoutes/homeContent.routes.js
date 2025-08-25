const express = require("express");
const router = express.Router();
const {
  getHomeContentForAndroid,
} = require("../../controllers/mobileControllers/homeContent.controller");
const { cacheMiddleware } = require("../../middleware/nodeCache");

router.get("/", cacheMiddleware(60), getHomeContentForAndroid);

module.exports = router;
