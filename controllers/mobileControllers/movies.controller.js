const movieService = require('../../services/mobileServices/movies.service');

// Get all movies
const getAllMovies = async (req, res) => {
  try {
    const movies = await movieService.getAllMovies();
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get a single movie by ID
const getMovieById = async (req, res) => {
  try {
    const movie = await movieService.getMovieById(req.params.id);
    if (!movie) return res.status(404).json({ status: 'error', message: 'Movie not found' });
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Create a new movie
const createMovie = async (req, res) => {
  try {
    const movie = await movieService.createMovie(req.body);
    res.status(201).json({ status: 'success', data: movie });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update a movie by ID
const updateMovie = async (req, res) => {
  try {
    const movie = await movieService.updateMovie(req.params.id, req.body);
    if (!movie) return res.status(404).json({ status: 'error', message: 'Movie not found' });
    res.status(200).json({ status: 'success', data: movie });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Delete a movie by ID
const deleteMovie = async (req, res) => {
  try {
    const movie = await movieService.deleteMovie(req.params.id);
    if (!movie) return res.status(404).json({ status: 'error', message: 'Movie not found' });
    res.status(200).json({ status: 'success', message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };
