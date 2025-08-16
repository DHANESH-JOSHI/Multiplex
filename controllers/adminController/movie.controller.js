const CloudflareStreamService = require("../../config/cloudFlareCDN");
const subscriptionModel = require("../../models/subscription.model");
const videosModel = require("../../models/videos.model");
const channelSubscribeModel = require("../../models/subcribe.model");
const Channel = require("../../models/channel.model");
const Currency = require("../../models/currency.model");
const MovieService = require("../../services/adminServices/movie.service");
const ViewTrackingService = require("../../services/viewTracking.service");
const DeviceValidationService = require("../../services/deviceValidation.service");

class MovieController {

  /** ─────────────────────────────────────────────
   *  Private helper – handles every file upload
   *  Always calls MovieService.uploadVideoOnly()
   *  Returns { videoPath, uploadMeta }
   *  ────────────────────────────────────────────*/
  async #handleUpload(req, title, creatorId = null) {
   
  }

  /** ─────────────────────────────────────────────
   *  Add a new movie
   *  ────────────────────────────────────────────*/
async addMovie(req, res) {
  try {
    const {
      title,
      genre,
      channel_id,
      release,
      price,
      is_paid,
      is_movie,
      publication,
      trailer,
      thumbnail_url,
      poster_url,
      enable_download,
      pricing,
      use_global_price
    } = req.body;

    // 🧠 Parse genre safely
    const parsedGenre = Array.isArray(genre)
      ? genre
      : typeof genre === "string"
        ? JSON.parse(genre)
        : [];

    // 💰 Parse pricing safely
    const parsedPricing = Array.isArray(pricing)
      ? pricing
      : typeof pricing === "string"
        ? JSON.parse(pricing)
        : [];

    // 🧾 Call Service
    const movie = await MovieService.addMovie({
      title,
      genre: parsedGenre,
      file: req.file?.path,
      channel_id,
      release,
      price,
      is_paid,
      is_movie,
      publication,
      trailer,
      thumbnail_url,
      poster_url,
      enable_download,
      pricing: parsedPricing,
      use_global_price
    });
    function cleanMongoDoc(doc) {
      const json = JSON.parse(JSON.stringify(doc));
      const walk = (obj) => {
        for (const key in obj) {
          if (typeof obj[key] === "object" && obj[key] !== null) {
            if (obj[key].$oid) obj[key] = obj[key].$oid;
            if (obj[key].$date) obj[key] = obj[key].$date;
            else walk(obj[key]);
          }
        }
      };
      walk(json);
      return json;
    }

    // ✅ Return clean response
    res.status(200).json({ success: true, movie: cleanMongoDoc(movie)  });

  } catch (error) {
    console.error("❌ Error in addMovie:", error);
    res.status(400).json({ message: `Error creating record: ${error.message}` });
  }
}








  /** ─────────────────────────────────────────────
   *  Upload-only endpoint (unchanged, still public)
   *  ────────────────────────────────────────────*/
  async uploadOnly(req, res) {
    try {
      const { title, creatorId } = req.body;
      const file = req.file?.path || null;
      const result = await MovieService.uploadVideoOnly(title, file, creatorId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /** ─────────────────────────────────────────────
   *  Get all movies
   *  ────────────────────────────────────────────*/
  async getAllMovies(req, res) {
    try {
    let result;
    let isSubscribed = false; // Default
    let userSubscribed = false;
    console.log(req.query);
    const { vId, user_id, channel_id } = req.query;

    if (vId) {
      const movieId = vId;
      const userId = req.user?.id || user_id || null;
      const deviceId = req.query.device_id || req.headers['x-device-id'] || null;
      
      // Device validation for video access
      if (userId && deviceId) {
        const deviceValidation = await DeviceValidationService.validateDeviceAccess(userId, deviceId);
        if (!deviceValidation.isValid) {
          return res.status(403).json({
            success: false,
            message: deviceValidation.message,
            errorCode: deviceValidation.errorCode
          });
        }
      }
      
      const country  = req.query.country; //|| req.headers['x-country'] ||
      const fieldAliases = { video_id: "videos_id", vid: "videos_id" };
      const rawField = req.query.fieldKey;
      const fieldName = fieldAliases[rawField] || rawField || "_id";
      const populate = req.query.populate?.split(",") || [];

      result = await MovieService.getMovieById(movieId, fieldName, populate, country);

      // Track view when movie is accessed by vId in getAllMovies
      if (result) {
        const ipAddress = req.ip || req.connection.remoteAddress;
        await ViewTrackingService.trackView(movieId, userId, ipAddress);
        console.log(`📹 View tracked in getAllMovies for vId: ${movieId}`);
        
        // Get updated view statistics after tracking
        const viewStats = await ViewTrackingService.getViewStats(movieId);
        
        // Add view statistics to result
        if (result.data && result.data[0]) {
          result.data[0].view_stats = {
            today_view: viewStats.today_view,
            weekly_view: viewStats.weekly_view, 
            monthly_view: viewStats.monthly_view,
            total_view: viewStats.total_view
          };
          result.data[0].total_view = viewStats.total_view; // For backward compatibility
        }
      }
      if (result?.data?.[0]) {
        const isMovie = result.data[0].is_movie;
        // Direct access from full data object since console shows it's there
        const videoData = result.data[0];
        
        // Method 1: Try direct property access
        let isChannelVideo = videoData.isChannel;
        
        // Method 2: If still undefined, get all property names and find it
        if (isChannelVideo === undefined) {
          const keys = Object.keys(videoData);
          const channelKeys = keys.filter(k => k.toLowerCase().includes('channel'));
          console.log("🔧 Available channel-related keys:", channelKeys);
          
          // Try each possible key
          for (const key of channelKeys) {
            if (key.toLowerCase() === 'ischannel') {
              isChannelVideo = videoData[key];
              break;
            }
          }
        }
        
        // Method 3: Last resort - parse from JSON string if needed
        if (isChannelVideo === undefined) {
          const jsonStr = JSON.stringify(videoData);
          const match = jsonStr.match(/"isChannel":\s*(true|false)/);
          isChannelVideo = match ? match[1] === 'true' : false;
        }
        
        // Dynamic related videos based on current video's isChannel property
        const currentChannelId = result.data[0].channel_id;
        const currentVideoId = result.data[0]._id;
        const userCountry = country; // User's country from query
        
        // console.log("🔍 Debug info:", {
        //   originalIsChannel: result.data[0].isChannel,
        //   finalIsChannelVideo: isChannelVideo,
        //   currentChannelId: currentChannelId,
        //   currentChannelIdType: typeof currentChannelId,
        //   currentVideoId: currentVideoId,
        //   is_movie: result.data[0].is_movie,
        //   fullData: result.data[0] // Show complete object
        // });
        
        let relatedVideosQuery;
        
        if (isChannelVideo === true) {
          // For channel videos: show same channel's is_movie=true and isChannel=true
          relatedVideosQuery = {
            channel_id: currentChannelId,           // Same channel restriction
            is_movie: true,
            isChannel: true,
            _id: { $ne: currentVideoId }           // Exclude current video
          };
        } else {
          // For non-channel videos: show same channel_id and isChannel=false
          relatedVideosQuery = {
            channel_id: currentChannelId,
            isChannel: false,
            _id: { $ne: currentVideoId }           // Exclude current video
          };
        }
        
        console.log("📋 Related videos query:", relatedVideosQuery);
        let relatedVideos = await videosModel.find(relatedVideosQuery).lean();
        
        // Apply country filtering to related videos (single pass)
        if (userCountry && relatedVideos.length > 0) {
          const userCurrency = await Currency.findOne({ country: userCountry });
          console.log("🔍 Related videos before filtering:", relatedVideos.length);
          console.log("💰 User currency:", userCurrency?.iso_code);
          
          const filteredRelatedVideos = [];
          
          for (const video of relatedVideos) {
            let includeVideo = false;
            
            console.log("🎬 Filtering related video:", {
              title: video.title,
              use_global_price: video.use_global_price,
              is_paid: video.is_paid,
              country: video.country,
              pricing: video.pricing
            });
            
            // Always allow global content
            if (video.use_global_price === true) {
              includeVideo = true;
              console.log("✅ Allowed: Global content");
            }
            // Priority 1: Check pricing array if present (country-specific pricing)
            else if (video.pricing && Array.isArray(video.pricing) && video.pricing.length > 0) {
              includeVideo = video.pricing.some(p => p.country === userCurrency?.iso_code);
              console.log("💰 Pricing array check:", {
                videoPricing: video.pricing,
                userCurrency: userCurrency?.iso_code,
                match: includeVideo
              });
            }
            // Priority 2: Check country ObjectIds if no pricing array (use normal price)
            else if (video.country && Array.isArray(video.country) && video.country.length > 0) {
              const videoCountryCurrencies = await Currency.find({ 
                _id: { $in: video.country } 
              }).select('country');
              
              const resolvedCountries = videoCountryCurrencies.map(c => c.country);
              includeVideo = resolvedCountries.includes(userCountry);
              
              console.log("🌍 Country ObjectId check (no pricing):", {
                videoCountryIds: video.country,
                resolvedCountries,
                userCountry,
                normalPrice: video.price,
                match: includeVideo
              });
            }
            // Priority 3: Allow content with no restrictions
            else {
              includeVideo = true;
              console.log("✅ Allowed: No geo restrictions");
            }
            
            if (includeVideo) {
              filteredRelatedVideos.push(video);
            }
          }
          
          relatedVideos = filteredRelatedVideos;
        }
        
        console.log("📊 Related videos (after country filter):", relatedVideos.length);
        
        // Debug: Check all videos in same channel
        const debugChannelVideos = await videosModel.find({ 
          channel_id: currentChannelId 
        }).select('_id title isChannel is_movie use_global_price pricing').lean();
        console.log("🔧 All videos in channel:", debugChannelVideos);
        // Check channel subscription (not plan subscription)
        let userChannelSubscribed = false;
        if (user_id && currentChannelId) {
          const channelSubscription = await channelSubscribeModel.findOne({
            user: user_id,
            channel: currentChannelId,  // Use video's channel_id
          });
          
          if (channelSubscription) {
            userChannelSubscribed = true;
          }
        }
        
        console.log("📝 Channel subscription check:", {
          user_id,
          currentChannelId,
          userChannelSubscribed
        });
        
        // Check channel subscription like in channel service
        let channelSubscribedStatus = false;
        if (user_id && currentChannelId) {
          // Find the channel document first
          const channelDoc = await Channel.findOne({ user_id: currentChannelId });
          
          console.log("🔍 Channel document search:", {
            searchBy_user_id: currentChannelId,
            channelFound: !!channelDoc,
            channelDoc_id: channelDoc?._id
          });
          
          if (channelDoc) {
            const userSubscribe = await channelSubscribeModel.findOne({
              user: user_id,
              channel: channelDoc._id,  // Use channel's _id, not user_id
            });
            
            console.log("🔍 Subscription search:", {
              user: user_id,
              channel: channelDoc._id,
              subscriptionFound: !!userSubscribe
            });
            
            if (userSubscribe) {
              channelSubscribedStatus = true;
            }
          }
        }
        
        console.log("📝 Final channel subscription result:", {
          user_id,
          currentChannelId,
          channelSubscribedStatus
        });
        
        // Update the global userSubscribed variable with channel subscription
        userSubscribed = channelSubscribedStatus;
        // console.log("data",userSubscribe);
        // result = result.data
        // result.data.userSubscribed = userSubscribe.length > 0;

        result.related_movie = relatedVideos;
      }

      
      

      // Step 2: Check Subscription
      if (user_id && channel_id) {
        const now = Date.now();
        
        // 🎯 Simple Logic: Check if user has admin plan (is_movie: false or doesn't exist)
        const userSubscription = await subscriptionModel.findOne({
          user_id,
          channel_id,
          status: 1,
          is_active: 1,
          timestamp_to: { $gt: now },
          plan_id: { $exists: true, $ne: null }
        }).populate({
          path: 'plan_id',
          select: 'price is_movie typename '
        });

        console.log("🔍 User subscription check:", {
          subscriptionFound: !!userSubscription,
          planExists: !!userSubscription?.plan_id,
          planIsMovie: userSubscription?.plan_id?.is_movie,
          planName: userSubscription?.plan_id?.name
        });

        // Admin plan: is_movie = false OR is_movie field doesn't exist
        let hasAdminAccess = false;
        if (userSubscription && userSubscription.plan_id) {
          const plan = userSubscription.plan_id;
          hasAdminAccess = (plan.is_movie === false || plan.is_movie === undefined);
          console.log("✅ Admin access:", hasAdminAccess, "| Plan is_movie:", plan.is_movie);
        }

        console.log("🎯 Final result - hasAdminAccess:", hasAdminAccess);

        if (hasAdminAccess) {
          isSubscribed = true;
        } else {
          // Check individual movie subscription
          const individualSubscription = await subscriptionModel.findOne({
            user_id,
            video_id: movieId,
            channel_id,
            status: 1,
            is_active: 1,
            timestamp_to: { $gt: now }
          }).populate({
            path: 'plan_id',
            match: { is_movie: true },
            select: 'name price is_movie type'
          });

          // Check no plan subscription
          const noPlanSubscription = await subscriptionModel.findOne({
            user_id,
            video_id: movieId,
            channel_id,
            status: 1,
            is_active: 1,
            timestamp_to: { $gt: now },
            plan_id: null
          });

          console.log("🔍 Individual subscription check:", {
            individualPlanSub: !!individualSubscription?.plan_id,
            noPlanSub: !!noPlanSubscription
          });

          if ((individualSubscription && individualSubscription.plan_id) || noPlanSubscription) {
            isSubscribed = true;
          }
        }
      }
    } else {
      // If no vId, fetch all movies
      result = await MovieService.getAllMovies(req.query);
    }

    // Step 3: Format Final Response
    const finalResponse = {
      message: result.message,
      isSubscribed,
      userSubscribed,
      data: result.data,
      related_movie: result.related_movie
    };

    res.status(200).json(finalResponse);
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      message: error.message,
      isSubscribed: false,
      data: []
    });
  }
}


  /** ─────────────────────────────────────────────
   *  Get movie by ID (with alias support)
   *  ────────────────────────────────────────────*/
  async getMovieById(req, res) {
    try {
      const movieId = req.query.vId;
      const userId = req.user?.id || req.query.uid || null; // Get user ID from auth or query
      const deviceId = req.query.device_id || req.headers['x-device-id'] || null;
      
      // Device validation for video access
      if (userId && deviceId) {
        const deviceValidation = await DeviceValidationService.validateDeviceAccess(userId, deviceId);
        if (!deviceValidation.isValid) {
          return res.status(403).json({
            success: false,
            message: deviceValidation.message,
            errorCode: deviceValidation.errorCode
          });
        }
      }
      
      const country  = req.query.country; //|| req.headers['x-country'] ||
      console.log(country);
      const fieldAliases = { video_id: "videos_id", vid: "videos_id" };
      const rawField = req.query.fieldKey;
      const fieldName = fieldAliases[rawField] || rawField || "_id";
      const populate = req.query.populate?.split(",") || [];

      const result = await MovieService.getMovieById(movieId, fieldName, populate, country);
      
      // Country-based content filtering with currency ObjectId resolution
      if (result?.data?.[0] && country) {
        const video = result.data[0];
        const userCountry = country; // "IN"
        
        // Get user's currency based on country
        const userCurrency = await Currency.findOne({ country: userCountry });
        
        // Check if video is available for user's country
        let isAvailableInUserCountry = false;
        let countrySpecificPrice = null;
        
        // Check global pricing (use_global_price: true)
        if (video.use_global_price === true) {
          isAvailableInUserCountry = true;
          countrySpecificPrice = video.price; // Use global price
        } 
        // Check country ObjectIds in video.country array
        else if (video.country && Array.isArray(video.country) && userCurrency) {
          // Resolve country ObjectIds to check if user's country is included
          const videoCountryCurrencies = await Currency.find({ 
            _id: { $in: video.country } 
          }).select('country iso_code');
          
          const isUserCountryIncluded = videoCountryCurrencies.some(curr => curr.country === userCountry);
          
          console.log("🌍 Country ObjectId resolution:", {
            userCountry,
            videoCountryObjectIds: video.country,
            resolvedCountries: videoCountryCurrencies.map(c => c.country),
            isUserCountryIncluded
          });
          
          if (isUserCountryIncluded) {
            isAvailableInUserCountry = true;
            // Look for country-specific pricing
            const countryPricing = video.pricing?.find(p => p.country === userCurrency.iso_code);
            countrySpecificPrice = countryPricing?.price || video.price;
          }
        }
        // Check country-specific pricing array
        else if (video.pricing && Array.isArray(video.pricing) && userCurrency) {
          const countryPricing = video.pricing.find(p => p.country === userCurrency.iso_code);
          if (countryPricing) {
            isAvailableInUserCountry = true;
            countrySpecificPrice = countryPricing.price;
          }
        }
        
        console.log("🌍 Final country filtering result:", {
          userCountry,
          userCurrencyCode: userCurrency?.iso_code,
          videoPricing: video.pricing,
          useGlobalPrice: video.use_global_price,
          isAvailableInUserCountry,
          countrySpecificPrice
        });
        
        // If content not available in user's country, return empty result
        if (!isAvailableInUserCountry) {
          return res.status(403).json({
            message: "Content not available in your region",
            country: userCountry,
            isSubscribed: false,
            userSubscribed: false,
            data: []
          });
        }
        
        // Update price based on user's country
        if (countrySpecificPrice !== null) {
          result.data[0].country_price = countrySpecificPrice;
          result.data[0].user_currency = userCurrency?.iso_code;
          result.data[0].currency_symbol = userCurrency?.symbol;
        }
      }

      // Track view when movie is accessed by ID
      if (movieId && result) {
        const ipAddress = req.ip || req.connection.remoteAddress;
        await ViewTrackingService.trackView(movieId, userId, ipAddress);
        console.log(`📹 View tracked for movie: ${movieId}`);
        
        // Get updated view statistics after tracking
        const viewStats = await ViewTrackingService.getViewStats(movieId);
        
        // Add view statistics to result
        if (result.data && result.data[0]) {
          result.data[0].view_stats = {
            today_view: viewStats.today_view,
            weekly_view: viewStats.weekly_view, 
            monthly_view: viewStats.monthly_view,
            total_view: viewStats.total_view
          };
          result.data[0].total_view = viewStats.total_view; // For backward compatibility
        }
      }

      res.status(200).json(result);
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }



  /** ─────────────────────────────────────────────
   *  Update movie (file upload handled the same way)
   *  ────────────────────────────────────────────*/
  async updateMovie(req, res) {
    try {
      /* ① upload new file if sent */
      const { videoPath } = await this.#handleUpload(req, req.body.title ?? "update");

      /* ② parse pricing safely */
      const {
        pricing,
        price,
        use_global_price,
        ...rest
      } = req.body;

      const parsedPricing = Array.isArray(pricing)
        ? pricing
        : typeof pricing === "string"
          ? JSON.parse(pricing)
          : [];

      const updatePayload = {
        ...rest,
        ...(videoPath ? { video_url: videoPath } : {}), // only set if new upload
        pricing: parsedPricing,
        price: Number(price) || 0,
        use_global_price: use_global_price !== "false"
      };

      const result = await MovieService.updateMovie(req.params.id, updatePayload);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /** ─────────────────────────────────────────────
   *  Delete movie
   *  ────────────────────────────────────────────*/
  async deleteMovie(req, res) {
    try {
      const result = await MovieService.deleteMovie(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new MovieController();
