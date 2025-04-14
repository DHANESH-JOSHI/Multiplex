const movieService = require('../../services/mobileServices/movies.service');

/**
 * Get all movies
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllMovies = async (req, res) => {
  try {
    const movies = await movieService.getAllMovies();
    res.status(200).json({
      status: 'success',
      data: movies
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Get a single movie by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMovieById = async (req, res) => {
  try {
    const movie = await movieService.getMovieById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: movie
    });
  } catch (error) {
    console.error(`Error fetching movie ${req.params.id}:`, error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ status: 'error', message: error.message });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Create a new movie
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createMovie = async (req, res) => {
  try {
    // Check for required fields
    const { videos_id, title } = req.body;
    if (!videos_id || !title) {
      return res.status(400).json({
        status: 'error',
        message: 'videos_id and title are required'
      });
    }

    // Get file data if available
    const fileData = req.file ? req.file.buffer : null;

    // Create movie
    const movie = await movieService.createMovie(req.body, fileData);

    res.status(201).json({
      status: 'success',
      message: 'Movie created successfully',
      data: movie
    });
  } catch (error) {
    console.error('Error creating movie:', error);
    if (error.message.includes('already exists')) {
      return res.status(409).json({ status: 'error', message: error.message });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Update a movie by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateMovie = async (req, res) => {
  try {
    // Get file data if available
    const fileData = req.file ? req.file.buffer : null;

    // Update movie
    const movie = await movieService.updateMovie(req.params.id, req.body, fileData);

    res.status(200).json({
      status: 'success',
      message: 'Movie updated successfully',
      data: movie
    });
  } catch (error) {
    console.error(`Error updating movie ${req.params.id}:`, error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ status: 'error', message: error.message });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Delete a movie by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteMovie = async (req, res) => {
  try {
    await movieService.deleteMovie(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting movie ${req.params.id}:`, error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ status: 'error', message: error.message });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };
