// const mongoose = require("mongoose");
const { default: mongoose } = require("mongoose");
const Favorite = require("../../models/wish_list.model");
const toObjectId = require("../../config/toObjectId");

class FavoriteService {
  async getFavorites(user) {
    try {
      const favorites = await Favorite.find({ user: user, status: 1 })
                          .populate({
                            path: "video",
                            populate: [
                              { path: "genre", model: "Genre" },
                              { path: "country", model: "country" },
                             
                            ]
                          })
                          .populate({
                            path: "episode",
                            model: "Episode",
                        
                          })
                          .populate({
                            path: "season",
                            model: "Season"
                          });


      return favorites;
    } catch (error) {
      console.error("Error fetching favorites:", error.message);
      throw error;
    }

  }

  async addFavorite(wish_list_type, user, video, episode) {
    try {
      const userId = toObjectId(user);
      const videoId = toObjectId(video);
      const episodeId = toObjectId(episode);

      const query = {
        user: userId,
        ...(videoId ? { video: videoId } : {}),
        ...(episodeId ? { episode: episodeId } : { episode: { $in: [null, undefined] } })
      };

      const exists = await Favorite.findOne(query);
      if (exists) return { success: false, message: "Already in favorites." };

      const newFavorite = new Favorite({
        wish_list_type,
        user: userId,
        video: videoId,
        episode: episodeId,
      });

      await newFavorite.save();
      return { success: true, message: "Added to favorites successfully." };
    } catch (error) {
      console.error("Error adding favorite:", error.message);
      throw error;
    }
  }



  async isFavorite(user, video, episode) {
  try {
    const userId = toObjectId(user);
    const videoId = toObjectId(video);
    const episodeId = toObjectId(episode);

    const query = {
      user: userId,
      ...(videoId ? { video: videoId } : {}),
      ...(episodeId ? { episode: episodeId } : { episode: { $in: [null, undefined] } })
    };

    const favorite = await Favorite.findOne(query);
    return !!favorite;
  } catch (error) {
    console.error("Error checking favorite:", error.message);
    throw error;
  }
}






  async removeFavorite(user, video, episode) {
    try {
      const result = await Favorite.findOneAndDelete({ user, video, episode });
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
