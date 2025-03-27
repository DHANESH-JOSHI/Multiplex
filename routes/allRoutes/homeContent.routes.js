const express = require("express");
const router = express.Router();
const { getHomeContentForAndroid } = require("../../controllers/api/homeContent.controller");

router.get("/home_content_for_android", getHomeContentForAndroid);

module.exports = router;
