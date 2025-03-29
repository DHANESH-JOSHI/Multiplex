const express = require("express");
const router = express.Router();
const { getAllGenres } = require("../../controllers/mobileControllers/allgenre.controller");

router.get("/", getAllGenres);

module.exports = router;
