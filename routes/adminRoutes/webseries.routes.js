const express = require("express");
const router = express.Router();
const {
  addWebSeries,
  addSeason,
  addEpisode,
  getAllWebSeries,
  getWebSeriesById,
  getWebSeriesSeasons,
  getSeasonEpisodes,
  updateWebSeries,
  deleteWebSeries
} = require("../../controllers/adminController/webseries.controller");

const {upload}  = require("../../middleware/multer");

// Routes for WebSeries
router.post("/", upload.single('file'), addWebSeries);
router.post("/season", addSeason);
router.post("/episode", upload.single('file'), addEpisode);
router.get("/", getAllWebSeries);
router.get("/:id", getWebSeriesById);
router.get("/:webSeriesId/seasons", getWebSeriesSeasons);
router.get("/seasons/:seasonId/episodes", getSeasonEpisodes);
router.put("/:id", upload.single('file'), updateWebSeries);
router.delete("/:id", deleteWebSeries);

module.exports = router;