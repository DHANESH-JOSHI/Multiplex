const express = require("express");
const router = express.Router();
const {
          getChannelListController,
          createChannelController,
          updateChannelController,
          deleteChannelController,
          statusChannelController,
          getChannelInfoController,
          getChannelVideo,
          setSubscribe,
          removeUser
     } = require("../../controllers/mobileControllers/channel.controller");

//Mobuile Channel Routes
router.get("/getchannellist", getChannelListController);
router.get("/getchannelinfo", getChannelInfoController);
router.get("/getchannelvideos", getChannelVideo);
router.post("/", createChannelController);
router.put("/:id", updateChannelController);
router.delete("/:id", deleteChannelController);
router.post("/status", statusChannelController);
router.get("/setsubcribe", setSubscribe);
router.get("/removeuser", removeUser);

//Admin Channel Routes
module.exports = router;