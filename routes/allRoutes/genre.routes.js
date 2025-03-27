const express = require("express");
const router = express.Router();
const { getAllGenres } = require("../../controllers/api/allgenre.controller");

router.get("/", getAllGenres);

module.exports = router;
