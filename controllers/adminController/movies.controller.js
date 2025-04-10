const axios = require("axios");
const videoSchema = require("../../models/videos.model");


// Create a new movie with Bunny API integration
exports.addMovies = async (req, res) => {
    try {
        const { videos_id, title } = req.body;

        if (!videos_id || !title) {
            return res.status(400).json({ message: "videos_id and title are required" });
        }

        const existingMovie = await videoSchema.findOne({ videos_id });

        if (existingMovie) {
            return res.status(409).json({ message: "Movie with this videos_id already exists" });
        }

        // Fetch movie data from Bunny API
        const bunnyResponse = await axios.get(`${BUNNY_API_URL}/${videos_id}`);

        if (!bunnyResponse.data) {
            return res.status(404).json({ message: "Movie data not found on Bunny API" });
        }

        const newMovie = new videoSchema({ ...bunnyResponse.data, videos_id });
        await newMovie.save();
        res.status(201).json({ message: "Movie added successfully", data: newMovie });
    } catch (error) {
        res.status(500).json({ message: "Error adding movie", error: error.message });
    }
};

// Get all movies with error handling
exports.getAllMovies = async (req, res) => {
    try {
        const movies = await videoSchema.find().populate("director writer country genre");
        res.status(200).json({ message: "Movies retrieved successfully", data: movies });
    } catch (error) {
        res.status(500).json({ message: "Error fetching movies", error: error.message });
    }
};

// Get a single movie by ID with error handling
exports.getMovieById = async (req, res) => {
    try {
        const movie = await videoSchema.findById(req.params.id).populate("director writer country genre");
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        res.status(200).json({ message: "Movie retrieved successfully", data: movie });
    } catch (error) {
        res.status(500).json({ message: "Error fetching movie", error: error.message });
    }
};

// Update a movie by ID with error handling
exports.updateMovie = async (req, res) => {
    try {
        const updatedMovie = await videoSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedMovie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        res.status(200).json({ message: "Movie updated successfully", data: updatedMovie });
    } catch (error) {
        res.status(500).json({ message: "Error updating movie", error: error.message });
    }
};

// Delete a movie by ID with error handling
exports.deleteMovie = async (req, res) => {
    try {
        const deletedMovie = await videoSchema.findByIdAndDelete(req.params.id);
        if (!deletedMovie) {
            return res.status(404).json({ message: "Movie not found" });
        }
        res.status(200).json({ message: "Movie deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting movie", error: error.message });
    }
};
