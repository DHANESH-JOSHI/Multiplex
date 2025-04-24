const mongoose = require("mongoose");
const Favorite = require("../../models/wish_list.model");

class FavoriteService {
  async getFavorites(user_id) {
    try {
      const favorites = await Favorite.aggregate([
        { $match: { user_id: user_id } },

        // Lookup Video Details
        {
          $lookup: {
            from: "videos",
            localField: "videos_id",
            foreignField: "videos_id",
            as: "video"
          }
        },
        { $unwind: { path: "$video", preserveNullAndEmptyArrays: true } },

        // Lookup Genres
        {
          $lookup: {
            from: "genre",
            localField: "video.genre",
            foreignField: "genre_id",
            as: "genre"
          }
        },

        // Lookup Countries
        {
          $lookup: {
            from: "countries",
            localField: "video.country",
            foreignField: "_id",
            as: "country"
          }
        },

        // Lookup Directors
        {
          $lookup: {
            from: "directors",
            localField: "video.director",
            foreignField: "_id",
            as: "director"
          }
        },

        // Lookup Writers
        {
          $lookup: {
            from: "writers",
            localField: "video.writer",
            foreignField: "_id",
            as: "writer"
          }
        },

        // Lookup Cast
        {
          $lookup: {
            from: "cast",
            localField: "video.cast",
            foreignField: "_id",
            as: "cast"
          }
        },

        // Lookup Videos file info
        {
          $lookup: {
            from: "video_files",
            localField: "video.videos_id",
            foreignField: "videos_id",
            as: "videos"
          }
        },

        // Final Project
        {
          $project: {
            _id: 0,
            videos_id: "$video.videos_id",
            title: "$video.title",
            description: "$video.description",
            slug: "$video.slug",
            release: "$video.release",
            runtime: "$video.runtime",
            video_quality: "$video.video_quality",
            is_tvseries: "$video.is_tvseries",
            thumbnail_url: "$video.thumbnail_url",
            poster_url: "$video.poster_url",
            videos: { $ifNull: ["$videos", []] },
            genre: { $ifNull: ["$genre", []] },
            country: { $ifNull: ["$country", []] },
            director: { $ifNull: ["$director", []] },
            writer: { $ifNull: ["$writer", []] },
            cast: { $ifNull: ["$cast", []] }
          }
        }
      ]);

      return favorites;
    } catch (error) {
      console.error("Error fetching favorites:", error.message);
      throw error;
    }

  }

  async addFavorite(wish_list_id, wish_list_type, user_id, videos_id, episodes_id) {
    try {
      const exists = await Favorite.findOne({ user_id, videos_id, episodes_id });
      if (exists) return { success: false, message: "Already in favorites." };

      const newFavorite = new Favorite({ wish_list_id, wish_list_type, user_id, videos_id, episodes_id });
      await newFavorite.save();

      return { success: true, message: "Added to favorites successfully." };
    } catch (error) {
      console.error("Error adding favorite:", error.message);
      throw error;
    }
  }

  async isFavorite(user_id, videos_id, episodes_id) {
    try {
      const favorite = await Favorite.findOne({ user_id, videos_id, episodes_id });
      return favorite ? true : false;
    } catch (error) {
      console.error("Error checking favorite:", error.message);
      throw error;
    }
  }

  async removeFavorite(user_id, videos_id, episodes_id) {
    try {
      const result = await Favorite.findOneAndDelete({ user_id, videos_id, episodes_id });
      if (result) {
        return { success: true, message: "Removed from favorites." };
      } else {
        return { success: false, message: "Not found in favorites." };
      }
    } catch (error) {
      console.error("Error removing favorite:", error.message);
      throw error;
    }
  }
}

module.exports = new FavoriteService();
