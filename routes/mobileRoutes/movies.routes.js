const express = require("express");
const router = express.Router();
const MovieController = require("../../controllers/adminController/movie.controller");
const { cacheMiddleware } = require("../../middleware/nodeCache");
const  {upload, deleteFileAfterResponse} = require("../../middleware/multer");


// Routes
router.get("/", cacheMiddleware(0),deleteFileAfterResponse, MovieController.getAllMovies);   
router.get("/single-movie", cacheMiddleware(0), MovieController.getMovieById);
router.post("/", upload.single('file'),deleteFileAfterResponse, MovieController.addMovie);
router.post("/upload", upload.single('file'),deleteFileAfterResponse, MovieController.uploadOnly);
router.put("/:id", MovieController.updateMovie);
router.delete("/:id", MovieController.deleteMovie);

module.exports = router;