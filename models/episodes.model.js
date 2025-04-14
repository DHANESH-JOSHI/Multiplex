const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  episode_number: { type: Number, required: true },
  title: { type: String, required: true },
  description: String,
  duration: String, // "45min"
  video_url: String,
  thumbnail: String,
  stream_key: String,
  file_source: String,
  source_type: String,
  release_date: Date,
  added_on: { type: Date, default: Date.now }
});

const seasonSchema = new mongoose.Schema({
  season_number: { type: Number, required: true },
  title: { type: String, required: true },
  description: String,
  release_year: Number,
  episodes: [episodeSchema], // Embedded episodes
  added_on: { type: Date, default: Date.now }
});

const webSeriesSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Web Series name
  description: String,
  genre: [String], // e.g., ["Drama", "Thriller"]
  language: String,
  release_year: Number,
  thumbnail: String,
  banner_image: String,
  seasons: [seasonSchema], // Embedded seasons
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WebSeries', webSeriesSchema);
