const express = require("express");
const router = express.Router();
const GenreController = require("../../controllers/adminController/genre.controller");

router.post("/add", GenreController.addGenre);     // Add Genre
router.get("/all", GenreController.getAllGenres);  // Get All Genres
router.get("/:id", GenreController.getGenreById);  // Get Genre by ID
router.put("/:id", GenreController.updateGenre);   // Update Genre
router.delete("/:id", GenreController.deleteGenre);// Delete Genre

module.exports = router;

