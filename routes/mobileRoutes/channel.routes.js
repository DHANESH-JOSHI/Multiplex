const express = require("express");
const router = express.Router();
const { getChannelListController } = require("../../controllers/mobileControllers/channel.controller");

router.get("/", getChannelListController);

module.exports = router;
