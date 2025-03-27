const express = require("express");
const router = express.Router();
const { getChannelListController } = require("../../controllers/api/channel.controller");

router.get("/getchannellist", getChannelListController);

module.exports = router;
