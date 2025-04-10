const express = require("express");
const router = express.Router();
const { addWebseries, getAllWebseries, getWebseriesById, updateWebseries, deleteWebseries } = require("../../controllers/adminController/webseries.controller");

router.post("/webseries", addWebseries);
router.get("/webseries", getAllWebseries);
router.get("/webseries/:id", getWebseriesById);
router.put("/webseries/:id", updateWebseries);
router.delete("/webseries/:id", deleteWebseries);

module.exports = router;
