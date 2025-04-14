const express = require("express");
const router = express.Router();
const { 
  getAllWebseries, 
  getWebseriesById, 
  createWebseries, 
  updateWebseries, 
  deleteWebseries,
  addSeason,
  addEpisode
} = require("../../controllers/mobileControllers/webseries.controller");

// Web series routes
router.get("/", getAllWebseries);
router.get("/:id", getWebseriesById);
router.post("/", createWebseries);
router.put("/:id", updateWebseries);
router.delete("/:id", deleteWebseries);

// Season routes
router.post("/:id/seasons", addSeason);

// Episode routes
router.post("/:id/seasons/:seasonId/episodes", addEpisode);

module.exports = router;
