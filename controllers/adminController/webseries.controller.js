const { default: mongoose } = require("mongoose");
const subscriptionModel = require("../../models/subscription.model");
const WebSeriesService = require("../../services/adminServices/webSeries.service");
const webseriesModel = require("../../models/webseries.model");

class WebSeriesController {
  // Add a new WebSeries with Seasons and Episodes
  async addWebSeries(req, res) {
    try {
      const { title, description, genre, release_year } = req.body;
      // Create base webseries data
      const webSeriesData = {
        title,
        description,
        genre,
        release_year
      };

      if (req.file) {
        webSeriesData.image_url = req.file.path;
      }

      // Create webseries only
      const webSeries = await WebSeriesService.createWebSeries(webSeriesData);
      res.status(201).json(webSeries);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async addSeason(req, res) {
    try {
      const { webseries_id, season_number,title } = req.body;
        console.log(req.body);
      // Create season
      const seasonData = {
        title,
        season_number,
        webseries_id
      };
      const createdSeason = await WebSeriesService.createSeason(seasonData, webseries_id);
      res.status(201).json(createdSeason);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async addEpisode(req, res) {
    try {
      const { season_id, title, episode_number, duration, creatorId } = req.body;
      const file = req.file?.path ||  null;
      const episodeData = {
        title,
        episode_number,
        duration,
        season_id,
        creatorId
      };
      const createdEpisode = await WebSeriesService.createEpisode(episodeData, file , season_id, creatorId);
      res.status(201).json(createdEpisode);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  // Get all WebSeries
    async getAllWebSeries(req, res) {
      try {
        const result = await WebSeriesService.getAllWebSeries();
        res.status(200).json(result);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  
    // Get WebSeries by ID
    async getWebSeriesById(req, res) {
  try {
    const { id, field, user_id } = req.query;

    // Step 1: Validate query params
    if (!id || !field || !user_id) {
      return res.status(400).json({
        message: "Missing required parameters: id, field, user_id",
        subscribed: false,
        data: []
      });
    }

    // Step 2: Check subscription
    const subscription = await subscriptionModel.findOne({ user_id })
      .populate({
        path: 'channel_id',
        select: 'channel_name _id phone email img'
      })
      .populate({
        path: 'plan_id',
        select: 'name price'
      })
      .lean();

    if (!subscription) {
      return res.status(403).json({
        message: "Access denied: No active subscription found.",
        subscribed: false,
        data: []
      });
    }

    // Step 3: Create query based on ID type
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { [field]: id }
      : { [field]: parseInt(id) };

    // Step 4: Fetch web series and populate seasons and episodes
    const webSeries = await webseriesModel.findOne(query).populate({
      path: "seasonsId",
      populate: {
        path: "episodesId",
      },
      select: "__v",
    });

    if (!webSeries) {
      return res.status(404).json({
        message: "Web series not found",
        subscribed: true,
        data: []
      });
    }

    // Step 5: Check if the subscription's channel matches
    if (
      webSeries.channel_id &&
      subscription.channel_id &&
      webSeries.channel_id.toString() !== subscription.channel_id._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied: Subscription does not match the web series channel.",
        subscribed: false,
        data: []
      });
    }

    // Step 6: Add isSubscribed flag and return response
    const webSeriesObj = webSeries.toObject();
    webSeriesObj.isSubscribed = true;

    res.status(200).json({
      message: "Web series fetched successfully",
      subscribed: true,
      data: webSeriesObj
    });

  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      subscribed: false,
      data: [],
      error: error.message
    });
  }
}



  
    // Get all seasons of a WebSeries
    async getWebSeriesSeasons(req, res) {
      try {
          const { webSeriesId: id, field } = req.query;   // rename webSeriesId → id

        const result = await WebSeriesService.getWebSeriesSeasons(field, id);
        res.status(200).json(result);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  
    // Get episodes of a specific season
    async getSeasonEpisodes(req, res) {
      try {
        const { seasonId } = req.params;
        const result = await WebSeriesService.getSeasonEpisodes(seasonId);
        res.status(200).json(result);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  
    // Update WebSeries
    async updateWebSeries(req, res) {
      try {
        const { id } = req.params;
        const updateData = req.body;
        const result = await WebSeriesService.updateWebSeries(id, updateData);
        res.status(200).json(result);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  
    // Delete WebSeries
    async deleteWebSeries(req, res) {
      try {
        const { id } = req.params;
        const result = await WebSeriesService.deleteWebSeries(id);
        res.status(200).json(result);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  
}

module.exports = new WebSeriesController();
