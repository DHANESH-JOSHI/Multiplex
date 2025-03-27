const express = require("express");
const router = express.Router();
const { getHomeContentForAndroid } = require("../../controllers/api/homeContent.controller");

router.get("/", getHomeContentForAndroid);

module.exports = router;
