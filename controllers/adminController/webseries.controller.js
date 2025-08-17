const { default: mongoose } = require("mongoose");
const subscriptionModel = require("../../models/subscription.model");
const WebSeriesService = require("../../services/adminServices/webSeries.service");
const webseriesModel = require("../../models/webseries.model");
const ViewTrackingService = require("../../services/viewTracking.service");
const DeviceValidationService = require("../../services/deviceValidation.service");
const CountryFilteringService = require("../../services/countryFiltering.service");

class WebSeriesController {
  // Add a new WebSeries with Seasons and Episodes
  async addWebSeries(req, res) {
    try {
      const { title, description, genre, release_year, price } = req.body;
      // Create base webseries data
      const webSeriesData = {
        title,
        description,
        genre,
        release_year,
        price
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
        const country = req.query.country || req.headers['x-country'] || null;
        const result = await WebSeriesService.getAllWebSeries();
        
        // Apply country filtering to web series
        if (country && result && Array.isArray(result)) {
          const filteredResult = await CountryFilteringService.applyCountryFilter(country, result);
          return res.status(200).json({
            data: filteredResult.content,
            message: filteredResult.message,
            filtered: true,
            originalCount: filteredResult.originalCount,
            filteredCount: filteredResult.filteredCount
          });
        }
        
        res.status(200).json(result);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  
    // Get WebSeries by ID
    async getWebSeriesById(req, res) {
  try {
    const { id, field, user_id, channel_id, country } = req.query;
    const deviceId = req.query.device_id || req.headers['x-device-id'] || null;

    // Step 1: Validate query params
    if (!id || !field || !user_id) {
      return res.status(400).json({
        message: "Missing required parameters: id, field, user_id, channel_id",
        subscribed: false,
        data: []
      });
    }

    // Step 1.5: Device validation for web series access
    let allowVideoAccess = true;
    if (user_id && deviceId) {
      const deviceValidation = await DeviceValidationService.validateDeviceAccess(user_id, deviceId);
      if (!deviceValidation.isValid) {
        return res.status(403).json({
          success: false,
          message: deviceValidation.message,
          errorCode: deviceValidation.errorCode,
          subscribed: false,
          data: []
        });
      }
      
      // Check if current device_id is different from user's registered device_id
      const user = deviceValidation.user;
      if (user && user.deviceid !== deviceId) {
        // Check if the new device is already being used by another user
        const deviceConflict = await DeviceValidationService.checkDeviceConflict(deviceId, user_id);
        if (deviceConflict.hasConflict) {
          allowVideoAccess = false;
          console.log(`❌ Device ${deviceId} is already registered to another user: ${deviceConflict.conflictingUserId}`);
        } else {
          // Reset device_id to the new device (this will block the previous device)
          const deviceUpdated = await DeviceValidationService.updateUserDevice(user_id, deviceId);
          if (deviceUpdated) {
            console.log(`✅ Device reset for user ${user_id}: ${user.deviceid} → ${deviceId} (previous device blocked)`);
            allowVideoAccess = true; // Grant access after device reset
          } else {
            allowVideoAccess = false;
            console.log(`❌ Failed to reset device for user ${user_id}`);
          }
        }
      }
    }

    // Step 2: Create query based on ID type
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { [field]: id }
      : { [field]: parseInt(id) };

    // Step 3: Fetch web series and populate seasons and episodes
    const webSeries = await webseriesModel.findOne(query).populate({
          path: "seasonsId",
          select: "title __v", // Make sure this line is correct
          populate: {
            path: "episodesId",
            select: "title video_url thumbnail_url download_url enable_download description __v" // optionally select episode fields  
          },
          options: {
            lean: true
          }
    });

    if (!webSeries) {
      return res.status(404).json({
        message: "Web series not found",
        subscribed: false,
        data: []
      });
    }

    const webSeriesObj = webSeries.toObject();

    // Apply country filtering to web series
    if (country) {
      const filteredResult = await CountryFilteringService.applyCountryFilter(country, webSeriesObj);
      if (filteredResult.isBlocked) {
        return res.status(403).json({
          message: filteredResult.message,
          reason: filteredResult.reason,
          country: filteredResult.country,
          subscribed: false,
          data: []
        });
      }
      // Update webseries with country-specific pricing
      Object.assign(webSeriesObj, filteredResult.content);
    }

    // Step 4: Check if user has active subscription for this web series
    let isSubscribed = false;
    if (user_id && channel_id) {
      const now = Date.now();
      
      // WebSeries is ONLY available via Admin subscription
      // NO Individual WebSeries subscriptions - only admin plans allowed
      const adminSubscription = await subscriptionModel.findOne({
        user_id,
        channel_id,
        status: 1,
        is_active: 1,
        timestamp_to: { $gt: now },
        plan_id: { $exists: true, $ne: null } // Must have a plan for WebSeries
      }).populate({
        path: 'plan_id',
        select: 'name price is_movie type'
      }).lean();

      console.log("WebSeries subscription check (Admin only):", {
        webSeriesId: webSeries._id,
        user_id,
        subscriptionFound: !!adminSubscription,
        planData: adminSubscription?.plan_id
      });
      
      // WebSeries access only for Admin plans (is_movie: false or missing field)
      if (adminSubscription && adminSubscription.plan_id) {
        const plan = adminSubscription.plan_id;
        
        // Admin plan: is_movie = false OR field doesn't exist (old plans)
        if (plan.is_movie === false || plan.is_movie === undefined) {
          isSubscribed = true;
          console.log("✅ WebSeries access granted via Admin subscription");
        } else {
          console.log("❌ Individual plan found but WebSeries requires Admin subscription");
        }
      } else {
        console.log("❌ No valid subscription found for WebSeries");
      }
    }

    // Step 5: If not subscribed or device already registered, nullify video_url in each episode
    if (!isSubscribed || !allowVideoAccess) {
      webSeriesObj.seasonsId.forEach(season => {
        season.episodesId.forEach(episode => {
          episode.video_url = null;
        });
      });
      
      if (!allowVideoAccess) {
        console.log(`❌ Video URLs nullified due to device conflict or reset failure`);
      }
    }

    // Step 6: Track view for web series access
    if (id) {
      const ipAddress = req.ip || req.connection.remoteAddress;
      await ViewTrackingService.trackView(id, user_id, ipAddress);
      console.log(`📺 View tracked for web series: ${id}`);
      
      // Get updated view statistics
      const viewStats = await ViewTrackingService.getViewStats(id);
      webSeriesObj.view_stats = {
        today_view: viewStats.today_view,
        weekly_view: viewStats.weekly_view, 
        monthly_view: viewStats.monthly_view,
        total_view: viewStats.total_view
      };
      webSeriesObj.total_view = viewStats.total_view; // For backward compatibility
    }

    // Step 7: Return response with isSubscribed flag
    webSeriesObj.isSubscribed = isSubscribed;

    res.status(200).json({
      message: "Web series fetched successfully",
      isSubscribed,
      data: webSeriesObj
    });

  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      isSubscribed: false,
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
