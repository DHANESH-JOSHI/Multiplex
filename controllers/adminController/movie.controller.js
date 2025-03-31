const MovieService = require("../../services/adminServices/movie.service");
const { validate } = require("../middleware/validation.middleware");

class MovieController {
    // Add a new movie
    async addMovie(req, res) {
        try {
            const result = await MovieService.addMovie(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Get all movies
    async getAllMovies(req, res) {
        try {
            const result = await MovieService.getAllMovies();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    //  Get movie by ID
    async getMovieById(req, res) {
        try {
            const result = await MovieService.getMovieById(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    // Update movie
    async updateMovie(req, res) {
        try {
            const result = await MovieService.updateMovie(req.params.id, req.body);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Delete movie
    async deleteMovie(req, res) {
        try {
            const result = await MovieService.deleteMovie(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
}

module.exports = new MovieController();
