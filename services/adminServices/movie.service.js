const Movie = require("../../models/videos.model");
const CloudCDNService = require("../../config/cloudFlareCDN");
const CRUDService = require("../../services/crud.service");

class MovieService {
    /**
     * Add a new movie entry and upload video to BunnyCDN.
     * @param {Object} param0 - Movie details.
     * @param {string} param0.videos_id - Unique ID of the movie.
     * @param {string} param0.title - Title of the movie.
     * @param {Buffer} param0.file - Video file buffer.
     * @returns {Promise<Object>} - Created movie data.
     */

    async addMovie({ id, title, genre, file, channel_id, release, price, is_paid, publication, trailer, thumbnail_url, poster_url, enable_download }) {
        let video_url = 'null';
        let download_url = 'null';
        let videos_id = null;

        const genreArray = Array.isArray(genre) ? genre : [genre];

        // Step 1: Upload video to Cloudflare (if file is provided)
        if (file) {
            const uploadResult = await CloudCDNService.uploadVideo(title, file, {
                creator: id,
                meta: { title },
            });

            if (!uploadResult || !uploadResult.success) {
                throw new Error("Failed to upload video to Cloudflare Stream");
            }

            const { uid, playback } = uploadResult;
            videos_id = parseInt(uid);
            video_url = playback.hls;

            // Step 2: Generate download link if enabled
            if (enable_download) {
                const downloadResult = await CloudCDNService.createDownload(uid);
                if (downloadResult.success) {
                    download_url = downloadResult.downloadUrl;
                } else {
                    console.warn("Download link generation failed:", downloadResult.error);
                }
            }
        }

        // Step 3: Create Movie entry
        return await CRUDService.create(Movie, {
            videoContent_id: videos_id,
            channel_id: channel_id,
            title,
            genre: genreArray,
            video_url,
            download_url,
            release,
            price,
            is_paid,
            is_movie: true,
            publication,
            trailer,
            thumbnail_url,
            poster_url,
            enable_download,
        });
    }

    async uploadVideoOnly(title, file, creatorId) {
        if (!file) {
            throw new Error("No video file provided.");
        }

        const uploadResult = await CloudCDNService.uploadVideo(title, file, {
            creator: creatorId,
            meta: { title },
        });

        if (!uploadResult || !uploadResult.success) {
            throw new Error("Video upload to Cloudflare Stream failed.");
        }

        const { uid, playback } = uploadResult;
        return {
            success: true,
            videoContent_id: parseInt(uid),
            video_url: playback.hls
        };
    }




    //Only Video Upload
    /**
     * Get all movies.
     * @returns {Promise<Array>} - List of movies.
     */
    async getAllMovies(queryParams) {
        return await CRUDService.getAllPages(Movie, {}, queryParams);
    }

    async getAllMoviesByCountry(queryParams) {
        return await CRUDService.getAllPages(Movie, {}, queryParams);
    }


    /**
     * Get a single movie by its ID.
     * @param {string|number} movieId - ID of the movie.
     * @returns {Promise<Object>} - Movie details.
     */
    async getMovieById(movieId, fieldName = "_id") {
        return await CRUDService.getById(Movie, fieldName, movieId);
    }

    /**
     * Update movie details.
     * @param {string|number} movieId - ID of the movie to update.
     * @param {Object} movieData - Updated movie details.
     * @returns {Promise<Object>} - Updated movie data.
     */
    async updateMovie(fieldName = "_id", movieId, movieData) {
        return await CRUDService.update(Movie, fieldName, movieId, movieData);
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
            await CloudCDNService.deleteVideo(deletedMovie.data.videoContent_id);
        }
        return deletedMovie;
    }
}

module.exports = new MovieService();