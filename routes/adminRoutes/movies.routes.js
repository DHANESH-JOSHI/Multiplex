const express = require("express");
const router = express.Router();
const {
    addMovies,
    getAllMovies,
    getMovieById,
    updateMovie,
    deleteMovie
} = require("../../controllers/adminController/movies.controller");

router.post("/movies", addMovies);
router.get("/movies", getAllMovies);
router.get("/movie/:id", getMovieById);
router.put("/movie/:id", updateMovie);
router.delete("/movie/:id", deleteMovie);

module.exports = router;
