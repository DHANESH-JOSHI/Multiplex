const express = require("express");
const router = express.Router();
const MovieController = require("../../controllers/adminController/movie.controller");
const { cacheMiddleware } = require("../../middleware/nodeCache");
const  {upload} = require("../../middleware/multer");


// Routes
router.get("/", cacheMiddleware(3600), MovieController.getAllMovies);
router.get("/:id", cacheMiddleware(3600), MovieController.getMovieById);
router.post("/", upload.single('file'), MovieController.addMovie);
router.post("/upload", upload.single('file'), MovieController.uploadOnly);
router.put("/:id", MovieController.updateMovie);
router.delete("/:id", MovieController.deleteMovie);

module.exports = router;