const FavoriteService = require("../../services/mobileServices/favorite.service");

class FavoriteController {
  async getFavorites(req, res) {
    try {
      const { user } = req.query;
      if (!user) return res.status(400).json({ message: "User ID is required" });

      const favorites = await FavoriteService.getFavorites(user);
      console.log(favorites);
      if (!favorites || favorites.length === 0) {
        return res.status(404).json({ message: "No favorites found." });
      }

      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }

  async addFavorite(req, res) {
    try {
      let { wish_list_type, user, video, episode } = req.body;

      if (!user || !wish_list_type) {
        return res.status(400).json({ message: "Missing required fields: user or wish_list_type" });
      }

      // ✅ Normalize episode/video: convert empty string to null
      episode = (episode && episode.trim() !== "") ? episode : null;
      video = (video && video.trim() !== "") ? video : null;

      // ✅ Only one of them should be provided
      // if ((video && episode) || (!video && !episode)) {
      //   return res.status(400).json({ message: "Either video or episode must be provided, not both." });
      // }

      const isAlreadyFavorite = await FavoriteService.isFavorite(user, video, episode);
      if (isAlreadyFavorite) {
        return res.status(409).json({ message: "Already in favorites." });
      }

      const result = await FavoriteService.addFavorite(wish_list_type, user, video, episode);
      return res.status(200).json({ message: result.message });

    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }




  async verifyFavorite(req, res) {
    try {
      const { user_id, videos_id, episode_id } = req.query;
      console.log(user_id, videos_id, episode_id);

      let user = user_id;
      let video_id = videos_id;

      if (!user || (!video_id && !episode_id)) {
        return res.status(400).json({
          status: false,
          message: "User ID and either Video ID or Episode ID are required",
        });
      }

      const favorite = await FavoriteService.isFavorite(user, video_id, episode_id);

      if (favorite) {
        return res.status(200).json({
          status: true,
          message: "Favorite exists.",
          exists: true,
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "Favorite does not exist.",
          exists: false,
        });
      }

    } catch (error) {
      console.error("Error verifying favorite:", error);
      return res.status(500).json({
        status: false,
        message: "Internal server error.",
      });
    }
  }


  async removeFavorite(req, res) {
    try {
      const { user, video_id, episode_id } = req.query;
      if (!user_id || (!video_id && !episode_id))
        return res.status(400).json({ message: "User ID and either Video or Episode ID required" });

      const result = await FavoriteService.removeFavorite(user, video_id, episode_id);
      if (!result) return res.status(404).json({ message: "Not found in favorites." });

      res.json({ message: "Removed from favorites." });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
}

module.exports = new FavoriteController();
