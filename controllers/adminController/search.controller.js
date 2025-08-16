const channelModel = require("../../models/channel.model");
const Movie = require("../../models/videos.model");
const webseriesModel = require("../../models/webseries.model");
const CountryFilteringService = require("../../services/countryFiltering.service");

class SearchController {
  /** ─────────────────────────────────────────────
    *  Search functionality
    *  ────────────────────────────────────────────*/
 async search(req, res) {
  try {
    const { s, type, range_to, range_from, tv_category_id, genre_id, country_id, country } = req.query;

    let q = s;
    let movieQuery = {};
    let tvseriesQuery = {};
    let tvChannelsQuery = {};

    if (q) {
      const regexQuery = { $regex: q, $options: "i" };
      movieQuery.title = regexQuery;
      tvseriesQuery.title = regexQuery;
      tvChannelsQuery.channel_name = regexQuery; // ✅ fixed this
    }

    if (country) {
      movieQuery.country = country;
      tvseriesQuery.country = country;
      tvChannelsQuery.country = country;
    }

    if (range_from && range_to) {
      movieQuery.release = { $gte: range_from, $lte: range_to };
      tvseriesQuery.release = { $gte: range_from, $lte: range_to };
    }

    if (genre_id) {
      movieQuery.genre_id = genre_id;
      tvseriesQuery.genre_id = genre_id;
    }

    if (tv_category_id) {
      tvChannelsQuery.category_id = tv_category_id;
    }

    let result = {
      movie: [],
      tvseries: [],
      tv_channels: []
    };

    if (type === "movie") {
      let movies = await Movie.find(movieQuery).select("id title thumbnail_url release video_url type use_global_price pricing country price").lean();
      // Apply country filtering to movies
      if (country && movies.length > 0) {
        const filteredResult = await CountryFilteringService.applyCountryFilter(country, movies);
        movies = filteredResult.content;
      }
      result.movie = movies;
    } else if (type === "tvseries") {
      let tvseries = await webseriesModel.find(tvseriesQuery).select("id title thumbnail_url release video_url type use_global_price pricing country price").lean();
      // Apply country filtering to tvseries
      if (country && tvseries.length > 0) {
        const filteredResult = await CountryFilteringService.applyCountryFilter(country, tvseries);
        tvseries = filteredResult.content;
      }
      result.tvseries = tvseries;
    } else if (type === "tvchannel" || type === "tvchannels") {
      result.tv_channels = await channelModel.find(tvChannelsQuery).select("id channel_name img stream_url type");
    } else {
      // If type not specified, return all filtered
      const [movieData, tvseriesData, tv_channels] = await Promise.all([
        Movie.find(movieQuery).select("id title thumbnail_url release video_url type use_global_price pricing country price").lean(),
        webseriesModel.find(tvseriesQuery).select("id title thumbnail_url release video_url type use_global_price pricing country price").lean(),
        channelModel.find(tvChannelsQuery).select("id channel_name img stream_url type")
      ]);
      
      // Apply country filtering to both movies and tvseries
      let movie = movieData;
      let tvseries = tvseriesData;
      
      if (country) {
        if (movieData.length > 0) {
          const filteredMovies = await CountryFilteringService.applyCountryFilter(country, movieData);
          movie = filteredMovies.content;
        }
        if (tvseriesData.length > 0) {
          const filteredTvseries = await CountryFilteringService.applyCountryFilter(country, tvseriesData);
          tvseries = filteredTvseries.content;
        }
      }
      
      result = { movie, tvseries, tv_channels };
    }

    res.status(200).json({ success: true, data: result });

  } catch (error) {
    console.error("❌ Error in search:", error);
    res.status(400).json({ message: `Error searching: ${error.message}` });
  }
}

  /** ─────────────────────────────────────────────
    *  Advanced search with filters
    *  ────────────────────────────────────────────*/
  async advancedSearch(req, res) {
    try {
      const { query, filters } = req.body;

      // 🔍 Parse filters safely
      const parsedFilters = Array.isArray(filters)
        ? filters
        : typeof filters === "string"
          ? JSON.parse(filters)
          : {};

      // Add your direct database queries or logic here
      const result = { query, filters: parsedFilters };
      
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("❌ Error in advancedSearch:", error);
      res.status(400).json({ message: `Error searching: ${error.message}` });
    }
  }
}

module.exports = new SearchController();