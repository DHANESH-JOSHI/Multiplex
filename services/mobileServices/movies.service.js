const Video = require('../../models/videos.model');
const bunnyService = require('./bunnyCDN.service');

/**
 * Fetch all movies
 * @returns {Promise<Array>} Array of movies
 */
const getAllMovies = async () => {
  try {
    // Get movies from database
    const movies = await Video.find({ is_tvseries: 0 }).populate('director writer country genre');

    // Try to get additional info from Bunny CDN for each movie
    const enhancedMovies = await Promise.all(movies.map(async (movie) => {
      try {
        // Try to get file details from Bunny CDN
        const bunnyData = await bunnyService.getFileDetails(['movies'], movie.videos_id.toString());
        return {
          ...movie.toObject(),
          bunny_url: bunnyData.HttpUrl || null,
          file_size: bunnyData.Length || null,
          last_changed: bunnyData.LastChanged || null
        };
      } catch (error) {
        // If Bunny CDN data not available, return original movie
        return movie.toObject();
      }
    }));

    return enhancedMovies;
  } catch (error) {
    throw new Error(`Error fetching movies: ${error.message}`);
  }
};

/**
 * Fetch a movie by ID
 * @param {string|number} id - Movie ID
 * @returns {Promise<Object>} Movie object
 */
const getMovieById = async (id) => {
  try {
    // Get movie from database
    const movie = await Video.findOne({ videos_id: id, is_tvseries: 0 }).populate('director writer country genre');

    if (!movie) {
      throw new Error('Movie not found');
    }

    // Try to get additional info from Bunny CDN
    try {
      const bunnyData = await bunnyService.getFileDetails(['movies'], id.toString());
      return {
        ...movie.toObject(),
        bunny_url: bunnyData.HttpUrl || null,
        file_size: bunnyData.Length || null,
        last_changed: bunnyData.LastChanged || null
      };
    } catch (error) {
      // If Bunny CDN data not available, return original movie
      return movie.toObject();
    }
  } catch (error) {
    throw new Error(`Error fetching movie: ${error.message}`);
  }
};

/**
 * Create a new movie
 * @param {Object} movieData - Movie data
 * @param {Buffer} fileData - Optional file data to upload to Bunny CDN
 * @returns {Promise<Object>} Created movie
 */
const createMovie = async (movieData, fileData = null) => {
  try {
    // Check if movie already exists
    const existingMovie = await Video.findOne({ videos_id: movieData.videos_id });
    if (existingMovie) {
      throw new Error('Movie with this ID already exists');
    }

    // If file data provided, upload to Bunny CDN
    if (fileData) {
      const uploadResult = await bunnyService.uploadFile(['movies'], movieData.videos_id.toString(), fileData);
      if (!uploadResult.success) {
        throw new Error(`Failed to upload to Bunny CDN: ${uploadResult.message}`);
      }

      // Add Bunny CDN URL to movie data
      movieData.file_url = uploadResult.url;
    }

    // Create movie in database
    const movie = new Video({
      ...movieData,
      is_tvseries: 0 // Ensure it's marked as a movie, not a TV series
    });

    return await movie.save();
  } catch (error) {
    throw new Error(`Error creating movie: ${error.message}`);
  }
};

/**
 * Update a movie by ID
 * @param {string|number} id - Movie ID
 * @param {Object} movieData - Updated movie data
 * @param {Buffer} fileData - Optional file data to upload to Bunny CDN
 * @returns {Promise<Object>} Updated movie
 */
const updateMovie = async (id, movieData, fileData = null) => {
  try {
    // Check if movie exists
    const movie = await Video.findOne({ videos_id: id });
    if (!movie) {
      throw new Error('Movie not found');
    }

    // If file data provided, upload to Bunny CDN
    if (fileData) {
      const uploadResult = await bunnyService.uploadFile(['movies'], id.toString(), fileData);
      if (!uploadResult.success) {
        throw new Error(`Failed to upload to Bunny CDN: ${uploadResult.message}`);
      }

      // Add Bunny CDN URL to movie data
      movieData.file_url = uploadResult.url;
    }

    // Update movie in database
    return await Video.findOneAndUpdate(
      { videos_id: id },
      movieData,
      { new: true }
    ).populate('director writer country genre');
  } catch (error) {
    throw new Error(`Error updating movie: ${error.message}`);
  }
};

/**
 * Delete a movie by ID
 * @param {string|number} id - Movie ID
 * @returns {Promise<Object>} Deleted movie
 */
const deleteMovie = async (id) => {
  try {
    // Check if movie exists
    const movie = await Video.findOne({ videos_id: id });
    if (!movie) {
      throw new Error('Movie not found');
    }

    // Try to delete from Bunny CDN
    try {
      await bunnyService.deleteFile(['movies'], id.toString());
    } catch (error) {
      console.error(`Failed to delete from Bunny CDN: ${error.message}`);
      // Continue with database deletion even if Bunny CDN deletion fails
    }

    // Delete from database
    return await Video.findOneAndDelete({ videos_id: id });
  } catch (error) {
    throw new Error(`Error deleting movie: ${error.message}`);
  }
};

module.exports = { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };
