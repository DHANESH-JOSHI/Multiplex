const express = require("express");
const router = express.Router();
const { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie } = require("../../controllers/mobileControllers/movies.controller");
const { cacheMiddleware } = require("../../middleware/nodeCache");

router.get("/", cacheMiddleware(3600) , getAllMovies);
router.get("/:id", cacheMiddleware(3600), getMovieById);
router.post("/", createMovie);
router.put("/:id", updateMovie);
router.delete("/:id", deleteMovie);

module.exports = router;
