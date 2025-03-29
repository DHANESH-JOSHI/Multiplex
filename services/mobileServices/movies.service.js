const Video = require('../../models/videos.model');

// Fetch all movies
const getAllMovies = async () => {
  try {
    return await Video.find();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Fetch a movie by ID
const getMovieById = async (id) => {
  try {
    return await Video.findOne({ videos_id: id });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Create a new movie
const createMovie = async (movieData) => {
  try {
    const movie = new Video(movieData);
    return await movie.save();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update a movie by ID
const updateMovie = async (id, movieData) => {
  try {
    return await Video.findOneAndUpdate({ videos_id: id }, movieData, { new: true });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Delete a movie by ID
const deleteMovie = async (id) => {
  try {
    return await Video.findOneAndDelete({ videos_id: id });
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };
