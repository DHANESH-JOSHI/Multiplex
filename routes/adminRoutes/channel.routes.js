const express = require("express");
const router = express.Router();
const { getChannelListController, createChannelController, updateChannelController, deleteChannelController, statusChannelController } = require("../../controllers/mobileControllers/channel.controller");

//Mobuile Channel Routes
router.get("/getchannellist", getChannelListController);
router.post("/", createChannelController);
router.put("/:id", updateChannelController);
router.delete("/:id", deleteChannelController);
router.post("/status", statusChannelController);

//Admin Channel Routes

module.exports = router;
