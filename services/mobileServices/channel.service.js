const Channel = require('../../models/channel.model');
const Video = require('../../models/videos.model');
const videoSchema = require('../../models/videos.model');
const Subscription = require('../../models/subcribe.model');
const mongoose = require('mongoose');

const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
const { subscribe } = require('../../routes/indexRoutes');
const subscriptionModel = require('../../models/subscription.model');
dayjs.extend(relativeTime);

const getChannelList = async (limit = 10, platform = null) => {
  try {
    // Step 1: Get approved channels, with optional platform filter
    const query = { status: 'approve' };
    if (platform) {
      query.platform = platform;
    }

    const channels = await Channel.find(query)
      .limit(limit)
      .lean();

    // Step 2: For each channel, fetch one latest video based on user_id
    const result = await Promise.all(
      channels.map(async (channel) => {
        const video = await Video.findOne({ channel_id: new mongoose.Types.ObjectId(channel.user_id) })
          .sort({ cre: -1 }) // latest video first
          .lean();

        if (!video) return null;

        return {
          channel_name: channel.channel_name,
          channel_img: channel.img,
          channel_id: channel._id.toString(),
          videos_id: video.videos_id.toString(),
          title: video.title,
          description: video.description,
          release: video.cre ? dayjs(video.cre).fromNow() : '',
          is_paid: video.is_paid,
          runtime: video.runtime,
          video_quality: video.video_quality,
          view: video.total_view,

          thumbnail_url: `https://multiplexplay.com/office/uploads/video_thumb/${video.videos_id}.jpg`,
          poster_url: `https://multiplexplay.com/office/uploads/poster_image/${video.videos_id}.jpg`,
          slug:
            video.title.toLowerCase().replace(/\s+/g, '-') +
            '-' +
            video.videos_id.toString()
        };
      })
    );

    // Remove nulls (in case no videos found)
    return result.filter(item => item !== null);

  } catch (error) {
    console.error('Error fetching channel list:', error);
    throw error;
  }
};




const getChannelInfoService = async (channel_id, uid) => {
  try {
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
    let subscriptionStatus = 0;
    if (objectUserId) {
      const subscription = await subscriptionModel.findOne({
        channel_id: objectChannelId,
        user_id: objectUserId
      });
      console.log("====>", subscription);
      if (subscription) {
        subscriptionStatus = 1;
      }
    }

    // Step 4: Get total views from videos under this channel
    const totalViewsResult = await videoSchema.aggregate([
      { $match: { imdbid: objectChannelId } },
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
      { $limit: 10 }
    ]);
    // console.log(relatedMovies);

    // Step 7: Prepare response
    const response = {
      channel_name: channel.channel_name,
      channel_id: String(channel._id),
      channel_img: channel.img || 'https://multiplexplay.com/office/uploads/default_image/poster.jpg',
      subcribe: subscriptionStatus,
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



const getSingleMovieDetailsByIdc = async (id, uid) => {
  try {
    // Step 1: Fetch video details
    const video = await Video.findById(id);
    if (!video) return {};

    // Step 2: Fetch channel details
    const channel = await Channel.findOne({ channel_id: video.imdbid });

    // Step 3: Check subscription
    let subscribed = 0;
    if (uid) {
      const sub = await Subscription.findOne({ c_id: video.imdbid, user_id: uid });
      if (sub) subscribed = 1;
    }

    // Step 4: Update view counts
    await Video.updateOne(
      { _id: id },
      {
        $inc: {
          today_view: 1,
          weekly_view: 1,
          monthly_view: 1,
          total_view: 1
        }
      }
    );

    // Step 5: Prepare and return movie details
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
      related_movie: [] // Optional: Add related movies logic
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
  return await Channel.findOne({ channel_id: channelId });
  // return await Channel.findOne(channelId).populate('video');
};

module.exports = {
  getChannelList,
  getChannelInfoService,
  getSingleMovieDetailsByIdc,
  createChannel,
  updateChannel,
  deleteChannel,
  getChannelById,

};