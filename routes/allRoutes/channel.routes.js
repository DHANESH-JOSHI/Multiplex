const express = require("express");
const router = express.Router();
const { getChannelListController } = require("../../controllers/api/channel.controller");

router.get("/", getChannelListController);

module.exports = router;
