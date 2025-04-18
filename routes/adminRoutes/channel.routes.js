const express = require("express");
const router = express.Router();
const { getChannelListController, statusChannelController } = require("../../controllers/mobileControllers/channel.controller");

//Mobuile Channel Routes
router.get("/", getChannelListController);
router.post("/status", statusChannelController);

//Admin Channel Routes

module.exports = router;
