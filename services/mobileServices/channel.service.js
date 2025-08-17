const Channel = require('../../models/channel.model');
const Video = require('../../models/videos.model');
const videoSchema = require('../../models/videos.model');
const Subscription = require('../../models/subcribe.model');
const ViewTrackingService = require('../viewTracking.service');
const DeviceValidationService = require('../deviceValidation.service');
const CountryFilteringService = require('../countryFiltering.service');
const mongoose = require('mongoose');

const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
const { subscribe } = require('../../routes/indexRoutes');
const subscriptionModel = require('../../models/subscription.model');
const subcribeModel = require('../../models/subcribe.model');
const channelModel = require('../../models/channel.model');
const userModel = require('../../models/user.model');

dayjs.extend(relativeTime);

const getChannelList = async (limit, platform = null, userCountry = null) => {
  try {
    console.log('GetChannelList Hitted');
    // Step 1: Build query to get approved movie channels
    const query = { status: 'approve' };
    if (platform) {
      query.platform = platform;
    }

    // Step 2: Fetch channels
    const channels = await Channel.find(query).limit(limit).lean();

    // Step 3: Fetch latest video per channel (country-filtered)
    const result = await Promise.all(
      channels.map(async (channel) => {
        // Get all videos for this channel, sorted by latest
        const channelVideos = await Video.find({
          channel_id: new mongoose.Types.ObjectId(channel.user_id),
          is_movie: true,
          isChannel: true
        })
          .sort({ cre: -1 }) // Latest first
          .lean();

        // Find first video available in user's country
        let availableVideo = null;
        
        if (userCountry) {
          for (const video of channelVideos) {
            const availability = await CountryFilteringService.checkContentAvailability(video, userCountry);
            if (availability.isAvailable) {
              availableVideo = video;
              console.log(`✅ Channel video available: ${channel.channel_name} - ${video.title} - ${availability.reason}`);
              break;
            }
          }
        } else {
          // If no country specified, use first video
          availableVideo = channelVideos[0];
        }

        // ❌ Skip channel if no available video found
        if (!availableVideo || !availableVideo.videos_id) {
          console.log(`🚫 Channel skipped - no available videos: ${channel.channel_name}`);
          return null;
        }

        // ✅ Construct and return formatted response with available video
        return {
          channel_name: channel.channel_name,
          channel_img: channel.img,
          channel_id: channel._id.toString(),
          videos_id: availableVideo.videos_id.toString(),
          title: availableVideo.title || '',
          description: availableVideo.description || '',
          release: availableVideo.cre ? dayjs(availableVideo.cre).fromNow() : '',
          runtime: availableVideo.runtime || '',
          video_quality: availableVideo.video_quality || '',
          view: availableVideo.total_view || 0,
          thumbnail_url: availableVideo.thumbnail_url || 'https://multiplexplay.com/storage/banners/1752765686_logo1.png',
          poster_url: availableVideo.poster_url || 'https://multiplexplay.com/storage/banners/1752765686_logo1.png',
          slug: `${(availableVideo.title || 'video').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')}-${availableVideo.videos_id}`
        };
      })
    );

    // Step 4: Filter out nulls (channels with no available videos for user's country)
    const filteredResult = result.filter(item => item !== null);
    
    console.log(`📊 Final channel list: ${filteredResult.length} channels with available content`);
    return filteredResult;

  } catch (error) {
    console.error('❌ Error fetching channel list:', error);
    throw error;
  }
};



const getChannelInfo = async (channelId, userId) => {
  try {
    const channel = await Channel.findById(channelId);

    if (!channel) {
      return { message: 'Channel not found.' };
    }

   
    return {
      channelName: channel.name,
      subscribers: channel.subscribers,
      isSubscribed: !!isSubscribed,
    };
  } catch (err) {
    console.error('Error fetching channel info:', err);
    throw err;
  }
};




const getChannelInfoService = async (channel_id, uid, userCountry = null) => {
  try {

    let  userSubscribed = false;
    // Step 1: Convert channel_id to ObjectId
    if (!mongoose.Types.ObjectId.isValid(channel_id)) {
      throw new Error("Invalid channel_id. Must be a valid ObjectId.");
    }

    const objectChannelId = new mongoose.Types.ObjectId(channel_id);
    const objectUserId = mongoose.Types.ObjectId.isValid(uid) ? new mongoose.Types.ObjectId(uid) : null;

    // Step 2: Fetch the channel by _id
    const channel = await Channel.findById(objectChannelId);
    const channel_user_id = new mongoose.Types.ObjectId(channel.user_id);
    if (!channel) {
      throw new Error("Channel not found.");
    }
  
    // Step 3: Check subscription
    let subscriptionStatus;
    if (objectUserId) {
      const subscription = await subscriptionModel.findOne({
        channel_id: objectChannelId,
        user_id: objectUserId
      });
      // console.log("====>", subscription);
      if (subscription) {
        
        subscriptionStatus = channel.subscribers;
      }
    }
  
    // Step 4: Get total views and video count from all videos under this channel
    const channelStatsResult = await videoSchema.aggregate([
      { $match: { channel_id: channel_user_id } },
      { 
        $group: { 
          _id: null, 
          total_views: { $sum: "$total_view" },
          today_views: { $sum: "$today_view" },
          weekly_views: { $sum: "$weekly_view" },
          monthly_views: { $sum: "$monthly_view" },
          video_count: { $sum: 1 }
        } 
      }
    ]);
    
    const channelStats = channelStatsResult.length > 0 ? channelStatsResult[0] : {
      total_views: 0,
      today_views: 0, 
      weekly_views: 0,
      monthly_views: 0,
      video_count: 0
    };
    
    console.log("📊 Channel Stats:", channelStats, "for channel_user_id:", channel_user_id);

    // Step 5: Count of subscribers
    
     const subscriberCount = await subscriptionModel.countDocuments({ c_id: objectChannelId });

    // Step 6: Related Movies - Only show isChannel=true and is_movie=true
    const relatedMovies = await videoSchema.aggregate([
      {
        $match: {
          channel_id: channel_user_id,
          isChannel: true,
          is_movie: true
        }
      },
    ]);
    // console.log(relatedMovies);
   const totalSubscribers = await subcribeModel.countDocuments({ channel: channel._id });

    // 2. Check if the current user is subscribed
    if (uid) {
      const userSubscribe = await subcribeModel.findOne({
        user: uid,
        channel: channel._id,
      });

      if (userSubscribe) {
        userSubscribed = true;
      }
    }



    // Step 7: Prepare response with detailed channel statistics
    const response = {
      channel_name: channel.channel_name,
      channel_id: String(channel.user_id),  // Use user_id instead of _id
      channel_img: channel.img || '',
      subcribe: totalSubscribers,
      userSubscribed: userSubscribed,
      view: channelStats.total_views,           // Total views of all channel videos
      count: String(subscriberCount),
      // Detailed channel statistics
      channel_stats: {
        total_videos: channelStats.video_count,
        total_views: channelStats.total_views,
        today_views: channelStats.today_views,
        weekly_views: channelStats.weekly_views,
        monthly_views: channelStats.monthly_views
      },
      related_movie: await CountryFilteringService.filterContentArray(
        relatedMovies.map(video => ({
        videos_id: String(video._id || ''),
        genre: video.genre || null,
        country: video.country || null,
        channel_name: channel.channel_name,
        channel_id: String(channel.user_id),  // Use user_id instead of _id in related_movie too
        channel_img: channel.img,
        title: video.title || '',
        view: video.total_view || 0,
        description: video.description || '',
        slug: `-${video.videos_id || ''}`,
        is_paid: String(video.is_paid || 0),
        is_tvseries: String(video.is_tvseries || 0),
        release: video.release || "2000",
        runtime: String(video.runtime || 0),
        video_quality: video.video_quality || 'HD',
        thumbnail_url: video.thumbnail_url || '',
        poster_url: video.poster_url || ''
      })), userCountry)
    };

    return response;

  } catch (error) {
    console.error("getChannelInfoService Error:", error.message);
    throw new Error(error.message || "Something went wrong on the server.");
  }
};

const getMovieDetailsBychannels = async (uid, userCountry = null) => {
  try {
    console.log('GetMovieDetailsByChannels Hitted');
    // Filter videos: only isChannel:true and must have valid ObjectId channel_id, sorted by creation date (latest first)
    const videos = await Video.find({
      isChannel: true,                                        // Only show channel videos
      channel_id: {
       $exists: true,                                        // Must exist
       $type: "objectId"                                     // Must be valid ObjectId (not string, not null)
      }
      }).sort({
      cre: -1
    });

    if (!videos.length) return [];

    let subscribedChannels = [];
    if (uid && mongoose.Types.ObjectId.isValid(uid)) {
      subscribedChannels = await subscriptionModel.find({ user_id: uid });
    }

    const result = await Promise.all(
      videos.map(async (video) => {
        
        const channel = await Channel.findOne({ user_id: new mongoose.Types.ObjectId(video.channel_id) });
        // console.log(channel);
        // if(!video.isChannel === false ) {
          // Skip this video if channel not found - don't show data at all
          if (!channel) {
            console.warn(`⚠️ Channel not found for video ${video._id}, skipping...`);
            return null;
          }

        const isSubscribed = subscribedChannels.some(
          (sub) => sub.channel_id.toString() === video.channel_id.toString()
        );
        let subscribeCount = channelModel.findOne({ _id: video.channel_id });
        // Views are now tracked separately via ViewTrackingService
        // Remove automatic view increment from listing API

        return {
          videos_id: video._id,
          title: video.title,
          description: video.description || '',
          admin: video.imdbid ? 0 : 1,
          subcribe: isSubscribed ? 1 : 0,
          slug: video.slug || '',
          release: video.release || '',
          runtime: video.runtime || '',
          video_quality: video.video_quality || '',
          channel_name: channel?.channel_name || '',
          channel_id: channel?._id || null,
          channel_img: channel?.img || '',
          is_tvseries: String(video.is_tvseries || '0'),
          is_paid: video.is_paid,
          enable_download: video.enable_download,
          download_links: video.enable_download === '1' ? [video.download_link] : [],
          thumbnail_url: video.thumbnail_url || '',
          poster_url: video.poster_url || '',
          videos: video.videos || [],
          genre: video.genre || [],
          country: video.country || [],
          director: video.director || [],
          writer: video.writer || [],
          cast: video.cast || [],
          cast_and_crew: [
            ...(video.director || []),
            ...(video.writer || []),
            ...(video.cast || [])
          ],
          trailler_youtube_source: video.trailer || '',
          related_movie: []
        };
      })
    );

    // Filter out null values (videos where channel was not found)  
    let filteredResult = result.filter(item => item !== null);
    
    // Apply country filtering to videos
    if (userCountry && filteredResult.length > 0) {
      console.log("🌍 Applying country filtering to GetMovieDetailsByChannels...");
      filteredResult = await CountryFilteringService.filterContentArray(filteredResult, userCountry);
    }
    
    return filteredResult;

  } catch (error) {
    console.error("Error in getMovieDetailsBychannels:", error.message);
    throw new Error("Something went wrong while fetching movie + channel details.");
  }
};




const getSingleMovieDetailsByIdc = async (id, uid) => {
  try {
    console.log("Received video ID:", id);

    // Step 1: Validate ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.warn("Invalid movie ID passed:", id);
      return {}; // Return empty safely instead of throwing
    }

    const objectVideoId = new mongoose.Types.ObjectId(id);

    // Step 2: Fetch video details
    const video = await Video.findById(objectVideoId);
    if (!video) return {};

    // Step 3: Fetch channel details
const channel = await Channel.findById(video.channel_id);

    // Step 4: Validate and check subscription
    let subscribed = 0;
    if (uid && mongoose.Types.ObjectId.isValid(uid)) {
      const objectUserId = new mongoose.Types.ObjectId(uid);

      const sub = await subscriptionModel.findOne({
        channel_id: video.channel_id,
        user_id: objectUserId,
      });

      if (sub) subscribed = 1;
    }

    // Step 5: Track view when video is accessed by ID (backend handled)
    await ViewTrackingService.trackView(id, uid, 'backend-access');

    // Step 6: Prepare and return movie details
    return {
      videos_id: video._id,
      title: video.title,
      description: video.description,
      admin: video.imdbid ? 0 : 1,
      subcribe: subscribed,
      slug: video.slug,
      release: video.release,
      runtime: video.runtime,
      video_quality: video.video_quality,
      channel_name: channel?.channel_name || '',
      channel_id: channel?.channel_id || '',
      channel_img: channel?.img || '',
      is_tvseries: '0',
      is_paid: video.is_paid,
      enable_download: video.enable_download,
      download_links: video.enable_download ? (video.download_links || []) : [],
      thumbnail_url: video.thumbnail_url || '',
      poster_url: video.poster_url || '',
      videos: video.videos || [],
      genre: video.genre || [],
      country: video.country || [],
      director: video.director || [],
      writer: video.writer || [],
      cast: video.cast || [],
      cast_and_crew: [
        ...(video.director || []),
        ...(video.writer || []),
        ...(video.cast || [])
      ],
      trailler_youtube_source: video.trailler_youtube_source || '',
      related_movie: []
    };

  } catch (error) {
    console.error("Error in getSingleMovieDetailsByIdc:", error.message);
    throw new Error("Something went wrong while fetching movie details.");
  }
};



// Create new channel
const createChannel = async (channelData) => {
  const channel = new Channel(channelData);
  return await channel.save();
};

// Update channel by ID
const updateChannel = async (channelId, updateData) => {
  return await Channel.findByIdAndUpdate(
    channelId,
    updateData,
    { new: true }
  ).populate('video');
};

// Delete channel by ID
const deleteChannel = async (channelId) => {
  return await Channel.findByIdAndDelete(channelId);
};

// Get single channel by ID
const getChannelById = async (channelId) => {
  return await Channel.findOne({ _id: channelId });
  // return await Channel.findOne(channelId).populate('video');
};






const subscribeToChannel = async (channelId, userId = null) => {
  try {
    const channelObjectId = channelId;

    // 1. Check if the channel exists
    const channel = await Channel.findById(channelObjectId);
    if (!channel) {
      return { message: 'Channel not found. Please provide a valid channel.' };
    }

    // 🔹 If userId is not provided, just return subscriber count
    if (!userId) {
      return {
        message: 'User ID not provided. Showing subscriber count only.',
        subscribers: channel.subscribers,
        isSubscribed: false,
      };
    }

    const userObjectId = userId;

    // 2. Check if already subscribed
    const subscription = await subcribeModel.findOne({
      channel: channelObjectId,
      user: userObjectId,
    });

    if (subscription) {
      return {
        message: 'You are already subscribed to this channel.',
        subscribers: channel.subscribers,
        isSubscribed: true,
      };
    }

    // 3. Create a new subscription
    const newSubscription = new subcribeModel({
      channel: channelObjectId,
      user: userObjectId,
    });
    await newSubscription.save();

    // 4. Increment subscribers count and return updated channel
    const updatedChannel = await Channel.findByIdAndUpdate(
      channelObjectId,
      { $inc: { subscribers: 1 } },
      { new: true }
    );

    return {
      message: 'Subscription successful.',
      subscribers: updatedChannel.subscribers,
      isSubscribed: true,
    };
  } catch (error) {
    console.error('Subscription Error:', error);
    throw error;
  }
};





module.exports = {
  getChannelList,
  getChannelInfoService,
  getSingleMovieDetailsByIdc,
  getMovieDetailsBychannels,
  createChannel,
  updateChannel,
  deleteChannel,
  getChannelById,
  subscribeToChannel
};