const CRUDService = require("./../crud.service");
const WebSeries = require("../../models/webseries.model");
const Season = require("../../models/seasons.model");
const Episode = require("../../models/episodes.model");
const CloudCDNService = require("../../config/cloudFlareCDN");
const { default: mongoose } = require("mongoose");

class WebSeriesService {
  // Create a new WebSeries with Seasons and Episodes
  async createWebSeries(data) {
    try {
      // Step 1: Create WebSeries
      const webSeries = await CRUDService.create(WebSeries, {
        title: data.title,
        description: data.description,
        image_url: data.image_url,
        creator: data.creatorId

      });
  
      return { 
        success: true,
        message: "WebSeries created successfully", 
        data: webSeries.data 
      };
    } catch (error) {
      throw new Error("Error creating WebSeries: " + error.message);
    }
  }

  async createSeason(seasonData, webSeriesId) {
    try {
      // console.log(seasonData);
      
      // Step 1: Create the season
      const season = await CRUDService.create(Season, {
        title: seasonData.title,
        description: seasonData.description,
        webSeries: webSeriesId,
      });
  
      const seasonId = season.data._id;
      console.log(seasonId, webSeriesId);
  
      // Step 2: Push the season's ID into the webSeries.seasons array
      await WebSeries.findByIdAndUpdate(
        webSeriesId,
        { $push: { seasonsId: seasonId } },
        { new: true }
      );
  
      return {
        success: true,
        message: "Season created successfully",
        data: season.data
      };
    } catch (error) {
      throw new Error("Error creating Season: " + error.message);
    }
  }
  
  

  async createEpisode(episodeData,file, seasonId, creatorId) {
    try {
  
      if (!file) {
        throw new Error(`Missing video file for episode: ${episodeData.title}`);
      }
      
      const uploadResult = await CloudCDNService.uploadVideo(episodeData.title,file, {
        creator: seasonId,
        meta: { title: episodeData.title },
      });

      const { uid, playback } = uploadResult;
      let videoId = parseInt(uid);
      const episode = await CRUDService.create(Episode, {
        title: episodeData.title,
        video_url: playback.hls,
        videoContent_id: videoId,
        seasonId: seasonId
      });
      
      await Season.findByIdAndUpdate(
        seasonId,
        { $push: { episodesId: episode.data._id } },
        { new: true }
      );
      
      return {
        success: true,
        message: "Episode created successfully",
        data: episode.data
      };
    } catch (error) {
      throw new Error("Error creating Episode: " + error.message);
    }
  }


  async getWebSeriesById(id, field, user_id) {
  try {
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { [field]: id }
      : { [field]: parseInt(id) };

    const webSeries = await WebSeries.findOne(query).populate({
      path: "seasonsId",
      populate: {
        path: "episodesId",
      },
      select: "__v",
    });

    if (!webSeries) {
      throw new Error("WebSeries not found.");
    }

    // Default to false
    let isSubscribed = false;

    if (user_id) {
      const subscription = await SubscriptionSchema.findOne({ user_id }).lean();

      if (
        subscription &&
        subscription.channel_id?.toString() === webSeries.channel_id?.toString()
      ) {
        isSubscribed = true;
      }
    }

    // Convert to plain object to add custom field
    const webSeriesObj = webSeries.toObject();
    webSeriesObj.isSubscribed = isSubscribed;

    return {
      message: "Record fetched successfully",
      data: webSeriesObj,
    };

  } catch (error) {
    throw new Error("Error fetching WebSeries: " + error.message);
  }
}


    async getWebSeriesSeasons(field, id) {

    try {
        const SeasonData = await CRUDService.getById(Season, field, id);
        return SeasonData;

      } catch (error) {
        throw new Error("" + error.message);
      }
    }
  
    async getAllWebSeries() {
      try {
        const webSeries = await CRUDService.getAll(WebSeries, {}, {
          populate: {
            path: "seasonsId",
            select: "title description episodesId",
            populate: {
              path: "episodesId",
              select: "title video_url",
            },
          },
        });
        return webSeries;
      } catch (error) {
        throw new Error("Error fetching all WebSeries: " + error.message);
      }
    }
  
    async getSeasons(webSeriesId) {
      try {
        const seasons = await CRUDService.find(Season, { webSeries: webSeriesId });
        if (!seasons.success) {
          throw new Error("Seasons not found");
        }
        return seasons;
      } catch (error) {
        throw new Error("Error fetching Seasons: " + error.message);
      }
    }
  
    async getEpisodes(seasonId) {
      try {
        const episodes = await CRUDService.find(Episode, { season: seasonId });
        if (!episodes.success) {
          throw new Error("Episodes not found");
        }
        return episodes;
      } catch (error) {
        throw new Error("Error fetching Episodes: " + error.message);
      }
    }
  
    async updateWebSeries(id, updateData) {
      try {
        const webSeries = await CRUDService.update(WebSeries, id, updateData);
        if (!webSeries.success) {
          throw new Error("Failed to update WebSeries");
        }
        return webSeries;
      } catch (error) {
        throw new Error("Error updating WebSeries: " + error.message);
      }
    }
  
    async deleteWebSeries(id) {
      try {
        // First delete all associated episodes and their videos
        const seasons = await CRUDService.find(Season, { webSeries: id });
        if (seasons.success) {
          for (let season of seasons.data) {
            const episodes = await CRUDService.find(Episode, { season: season._id });
            if (episodes.success) {
              for (let episode of episodes.data) {
                // Delete video from CloudFlare
                await CloudflareStreamService.deleteVideo(episode.videoContent_id);
                // Delete episode record
                await CRUDService.delete(Episode, episode._id);
              }
            }
            // Delete season
            await CRUDService.delete(Season, season._id);
          }
        }
  
        // Finally delete the web series
        const webSeries = await CRUDService.delete(WebSeries, id);
        if (!webSeries.success) {
          throw new Error("Failed to delete WebSeries");
        }
        return { message: "WebSeries and all associated content deleted successfully" };
      } catch (error) {
        throw new Error("Error deleting WebSeries: " + error.message);
      }
    }
}

module.exports = new WebSeriesService();