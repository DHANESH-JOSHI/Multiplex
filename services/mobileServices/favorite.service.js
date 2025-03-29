const mongoose = require("mongoose");
const Favorite = require("../../models/wish_list.model");

class FavoriteService {
  async getFavorites(user_id) {
    try {
      const favorites = await Favorite.aggregate([
        { $match: { user_id: user_id  } }, // Match favorites for the user

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
        
        // Lookup Country
        {
          $lookup: {
            from: "countries",
            localField: "video.country",
            foreignField: "_id",
            as: "country"
          }
        },

        // Lookup Director
        {
          $lookup: {
            from: "directors",
            localField: "video.director",
            foreignField: "_id",
            as: "director"
          }
        },

        // Lookup Writer
        {
          $lookup: {
            from: "writers",
            localField: "video.writer",
            foreignField: "_id",
            as: "writer"
          }
        },

        // Lookup Cast (if required)
        {
          $lookup: {
            from: "cast",
            localField: "video.cast",
            foreignField: "_id",
            as: "cast"
          }
        },

        // Reshape the output & Ensure Empty Arrays Instead of Null
        {
          $project: {
            _id: 1,
            wish_list_id: 1,
            wish_list_type: 1,
            user_id: 1,
            videos_id: 1,
            episodes_id: 1,
            create_at: 1,
            status: 1,
            video: {
              _id: "$video._id",
              videos_id: "$video.videos_id",
              imdbid: "$video.imdbid",
              title: "$video.title",
              seo_title: "$video.seo_title",
              slug: "$video.slug",
              description: "$video.description",
              stars: "$video.stars",
              rating: "$video.rating",
              release: "$video.release",
              video_type: "$video.video_type",
              runtime: "$video.runtime",
              video_quality: "$video.video_quality",
              is_paid: "$video.is_paid",
              publication: "$video.publication",
              lid: "$video.lid",
              trailer: "$video.trailer",
              trailler_youtube_source: "$video.trailler_youtube_source",
              enable_download: "$video.enable_download",
              focus_keyword: "$video.focus_keyword",
              meta_description: "$video.meta_description",
              tags: "$video.tags",
              imdb_rating: "$video.imdb_rating",
              is_tvseries: "$video.is_tvseries",
              total_rating: "$video.total_rating",
              today_view: "$video.today_view",
              weekly_view: "$video.weekly_view",
              monthly_view: "$video.monthly_view",
              total_view: "$video.total_view",
              last_ep_added: "$video.last_ep_added",
              cre: "$video.cre"
            },
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
