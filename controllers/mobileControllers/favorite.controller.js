const FavoriteService = require("../../services/mobileServices/favorite.service");

class FavoriteController {
  async getFavorites(req, res) {
    try {
      const { user_id } = req.query;
      if (!user_id) return res.status(400).json({ message: "User ID is required" });

      const favorites = await FavoriteService.getFavorites(user_id);
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
      const { wish_list_id, wish_list_type, user_id, video_id, episode_id } = req.body;
      if (!user_id || !wish_list_id || !wish_list_type)
        return res.status(400).json({ message: "Missing required fields" });

      // Check if favorite already exists
      const existingFavorite = await FavoriteService.isFavorite(user_id, video_id, episode_id);
      if (existingFavorite) {
        return res.status(409).json({ message: "Already in favorites." });
      }

      await FavoriteService.addFavorite(wish_list_id, wish_list_type, user_id, video_id, episode_id);
      res.json({ message: "Added to favorites." });
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }

  async verifyFavorite(req, res) {
    try {
      const { user_id, video_id, episode_id } = req.query;
      if (!user_id || (!video_id && !episode_id))
        return res.status(400).json({ message: "User ID and either Video or Episode ID required" });

      const favorite = await FavoriteService.isFavorite(user_id, video_id, episode_id);
      res.json({ exists: !!favorite });
    } catch (error) {
      console.error("Error verifying favorite:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }

  async removeFavorite(req, res) {
    try {
      const { user_id, video_id, episode_id } = req.query;
      if (!user_id || (!video_id && !episode_id))
        return res.status(400).json({ message: "User ID and either Video or Episode ID required" });

      const result = await FavoriteService.removeFavorite(user_id, video_id, episode_id);
      if (!result) return res.status(404).json({ message: "Not found in favorites." });

      res.json({ message: "Removed from favorites." });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
}

module.exports = new FavoriteController();
