const Movie = require("../../models/videos.model");
const BunnyCDNService = require("../services/bunnyCDN.service");
const CRUDService = require("../services/crud.service");

class MovieService {
    /**
     * Add a new movie entry and upload video to BunnyCDN.
     * @param {Object} param0 - Movie details.
     * @param {string} param0.videos_id - Unique ID of the movie.
     * @param {string} param0.title - Title of the movie.
     * @param {Buffer} param0.file - Video file buffer.
     * @returns {Promise<Object>} - Created movie data.
     */
    async addMovie({ videos_id, title, file }) {
        // Check if movie already exists
        const existingMovie = await CRUDService.getById(Movie, videos_id).catch(() => null);
        if (existingMovie) {
            throw new Error("Movie with this videos_id already exists");
        }

        // Upload video to BunnyCDN
        const uploadResponse = await BunnyCDNService.uploadFile("movies", videos_id, file);
        if (!uploadResponse.success) {
            throw new Error("Failed to upload video to BunnyCDN");
        }

        // Fetch movie data from BunnyCDN
        const movieData = await BunnyCDNService.getFileDetails(["movies"], videos_id);
        if (!movieData) {
            throw new Error("Movie data not found on BunnyCDN");
        }

        // Create new movie entry
        return await CRUDService.create(Movie, { 
            ...movieData, videos_id, title 
        
        });
    }

    /**
     * Get all movies.
     * @returns {Promise<Array>} - List of movies.
     */
    async getAllMovies() {
        return await CRUDService.getAll(Movie);
    }

    /**
     * Get a single movie by its ID.
     * @param {string|number} movieId - ID of the movie.
     * @returns {Promise<Object>} - Movie details.
     */
    async getMovieById(movieId) {
        return await CRUDService.getById(Movie, movieId);
    }

    /**
     * Update movie details.
     * @param {string|number} movieId - ID of the movie to update.
     * @param {Object} movieData - Updated movie details.
     * @returns {Promise<Object>} - Updated movie data.
     */
    async updateMovie(movieId, movieData) {
        return await CRUDService.update(Movie, movieId, movieData);
    }

    /**
     * Delete a movie by its ID and remove associated file from BunnyCDN.
     * @param {string|number} movieId - ID of the movie to delete.
     * @returns {Promise<Object>} - Deletion confirmation.
     */
    async deleteMovie(movieId) {
        // Delete movie record from database
        const deletedMovie = await CRUDService.delete(Movie, movieId);
        if (deletedMovie) {
            // Delete associated file from BunnyCDN if movie exists
            await BunnyCDNService.deleteFile(["movies"], deletedMovie.data.videos_id);
        }
        return deletedMovie;
    }
}

module.exports = new MovieService();
