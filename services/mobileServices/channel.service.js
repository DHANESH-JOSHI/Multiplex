const Channel = require('../../models/channel.model');
const Video = require('../../models/videos.model');
const videoSchema = require('../../models/videos.model');
const Subscription = require('../../models/subcribe.model');
const mongoose = require('mongoose');

const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
const { subscribe } = require('../../routes/indexRoutes');
const subscriptionModel = require('../../models/subscription.model');
const subcribeModel = require('../../models/subcribe.model');
const channelModel = require('../../models/channel.model');

dayjs.extend(relativeTime);

const getChannelList = async (limit, platform = null) => {
  try {
    // Step 1: Get approved channels, with optional platform filter
    const query = { status: 'approve' };
      if (platform) {
      query.platform = platform;
    }

    const channels = await Channel.find(query).limit(limit).lean();

    const result = await Promise.all(
      channels.map(async (channel) => {
        const video = await Video.findOne({
          channel_id: new mongoose.Types.ObjectId(channel.user_id)
        })
          .sort({ cre: -1 })
          .lean();

        // ❌ Skip if no video found
        if (!video || !video.videos_id) {
          return null;
        }

        // ✅ Construct response
        return {
          channel_name: channel.channel_name,
          channel_img: channel.img,
          channel_id: channel._id.toString(),
          videos_id: video.videos_id.toString(),
          title: video.title || '',
          description: video.description || '',
          release: video.cre ? dayjs(video.cre).fromNow() : '',
          runtime: video.runtime || '',
          video_quality: video.video_quality || '',
          view: video.total_view || 0,
          is_movie: true,
          thumbnail_url: video.thumbnail_url || 'https://multiplexplay.com/storage/banners/1752765686_logo1.png',
          poster_url: video.poster_url || 'https://multiplexplay.com/storage/banners/1752765686_logo1.png',
          slug: video.title.toLowerCase().replace(/\s+/g, '-') + '-' + video.videos_id.toString()
        };
      })
    );

    // ✅ Remove any channels without valid videos
    return result.filter(item => item !== null);

  } catch (error) {
    console.error('Error fetching channel list:', error);
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




const getChannelInfoService = async (channel_id, uid) => {
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

    // Step 4: Get total views from videos under this channel
    const totalViewsResult = await videoSchema.aggregate([
      { $match: { channel_id: objectChannelId } },
      { $group: { _id: null, total_view: { $sum: "$total_view" } } }
    ]);

    const totalViewCount = totalViewsResult.length > 0 ? totalViewsResult[0].total_view : 0;

    // Step 5: Count of subscribers
    
     const subscriberCount = await subscriptionModel.countDocuments({ c_id: objectChannelId });

    // Step 6: Related Movies
    const relatedMovies = await videoSchema.aggregate([
      {
        $match: {
          channel_id: objectChannelId,
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



    // Step 7: Prepare response
    const response = {
      channel_name: channel.channel_name,
      channel_id: String(channel._id),
      channel_img: channel.img || 'https://multiplexplay.com/office/uploads/default_image/poster.jpg',
      subcribe: totalSubscribers,
      userSubscribed: userSubscribed,
      view: String(totalViewCount),
      count: String(subscriberCount),
      related_movie: relatedMovies.map(video => ({
        videos_id: String(video._id || ''),
        genre: video.genre || null,
        country: video.country || null,
        channel_name: channel.channel_name,
        channel_id: String(channel._id),
        channel_img: channel.img,
        title: video.title || '',
        view: String(video.total_view || 0),
        description: video.description || '',
        slug: `-${video.videos_id || ''}`,
        is_paid: String(video.is_paid || 0),
        is_tvseries: String(video.is_tvseries || 0),
        release: video.release || "2000",
        runtime: String(video.runtime || 0),
        video_quality: video.video_quality || 'HD',
        thumbnail_url: video.thumbnail_url || '',
        poster_url: video.poster_url || ''
      }))
    };

    return response;

  } catch (error) {
    console.error("getChannelInfoService Error:", error.message);
    throw new Error(error.message || "Something went wrong on the server.");
  }
};

const getMovieDetailsBychannels = async (uid) => {
  try {
    const videos = await Video.find({});
    if (!videos.length) return [];

    let subscribedChannels = [];
    if (uid && mongoose.Types.ObjectId.isValid(uid)) {
      subscribedChannels = await subscriptionModel.find({ user_id: uid });
    }

    const result = await Promise.all(
      videos.map(async (video) => {
        const channel = await Channel.findById(video.channel_id);
        // console.log(channel);
        const isSubscribed = subscribedChannels.some(
          (sub) => sub.channel_id.toString() === video.channel_id.toString()
        );
        let subscribeCount = channelModel.findOne({ _id: video.channel_id });
        console.log(subscribeCount);
        await Video.updateOne(
          { _id: video._id },
          {
            $inc: {
              today_view: 1,
              weekly_view: 1,
              monthly_view: 1,
              total_view: 1,
            },
          }
        );

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
          channel_id: channel?._id || '',
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

    return result;

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

    // Step 5: Update view counts
    await Video.updateOne(
      { _id: objectVideoId },
      {
        $inc: {
          today_view: 1,
          weekly_view: 1,
          monthly_view: 1,
          total_view: 1
        }
      }
    );

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