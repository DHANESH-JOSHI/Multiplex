const express = require("express");
const router = express.Router();
const { getFavorites, addFavorite, verifyFavorite, removeFavorite } = require("../../controllers/mobileControllers/favorite.controller");

router.get("/", getFavorites);
router.post("/", addFavorite);
router.get("/verify", verifyFavorite);
router.delete("/remove", removeFavorite);

module.exports = router;