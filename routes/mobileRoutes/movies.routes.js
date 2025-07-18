const express = require("express");
const router = express.Router();
const MovieController = require("../../controllers/adminController/movie.controller");
const { cacheMiddleware } = require("../../middleware/nodeCache");
const  {upload, deleteFileAfterResponse} = require("../../middleware/multer");


// Routes
router.get("/",deleteFileAfterResponse, MovieController.getAllMovies);    // cacheMiddleware(0),
router.get("/single-movie",  MovieController.getMovieById); //cacheMiddleware(0),
router.post("/", upload.single('file'),deleteFileAfterResponse, MovieController.addMovie);
router.post("/upload", upload.single('file'),deleteFileAfterResponse, MovieController.uploadOnly);
router.put("/:id", MovieController.updateMovie);
router.delete("/:id", MovieController.deleteMovie);

module.exports = router;