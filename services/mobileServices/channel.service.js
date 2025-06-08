const Channel = require('../../models/channel.model');
const Video = require('../../models/videos.model');
const videoSchema = require('../../models/videos.model');
const Subscription = require('../../models/subcribe.model');
const mongoose = require('mongoose');

const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
const { subscribe } = require('../../routes/indexRoutes');
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
    //  Step 1: Validate and Parse channel_id
    const parsedChannelId = parseInt(channel_id);
    const parsedUserId = parseInt(uid);

    if (isNaN(parsedChannelId)) {
      throw new Error("Invalid channel_id. Must be a number.");
    }

    //  Step 2: Fetch channel details
    const channel = await Channel.findOne({ channel_id: parsedChannelId });

    if (!channel) {
      throw new Error("Channel not found.");
    }

    let stt = 0; // Subscription status

    //  Step 3: Check subscription if user_id is provided
    if (parsedUserId > 0) {
      const subscription = await Subscription.find({ c_id: parsedChannelId, user_id: parsedUserId });
      if (subscription.length > 0) {
        stt = 1; // User is subscribed
      }
    }

    //  Step 4: Get total views for the channel's videos
    const totalViews = await videoSchema.aggregate([
      { $match: { imdbid: parsedChannelId } },
      { $group: { _id: null, total_view: { $sum: "$total_view" } } }
    ]);

    const totalViewCount = totalViews.length > 0 ? totalViews[0].total_view : 0;

    //  Step 5: Fetch the count of subscribers
    const subscriberCount = await Subscription.countDocuments({ c_id: parsedChannelId });

    //  Step 6: Fetch related videos
    const relatedMovies = await videoSchema.aggregate([
      { $match: { imdbid: parsedChannelId, is_tvseries: { $ne: 1 }, publication: 1 } },
      { $limit: 10 }, // Adjust based on your needs
    ]);

    //  Step 7: Prepare the response
    const response = {
      channel_name: channel.channel_name,
      channel_id: String(channel.channel_id),
      channel_img: channel.img || 'https://multiplexplay.com/office/uploads/default_image/poster.jpg',
      subcribe: stt,
      view: String(totalViewCount),
      count: String(subscriberCount),
      related_movie: relatedMovies.map(videoSchema => ({
        videos_id: String(videoSchema.videos_id),
        genre: videoSchema.genre || null,
        country: videoSchema.country || null,
        channel_name: channel.channel_name,
        channel_id: String(channel.channel_id),
        channel_img: channel.img,
        title: videoSchema.title,
        view: String(videoSchema.total_view || 0),
        description: videoSchema.description || "",
        slug: `-${videoSchema.videos_id}`,
        is_paid: String(videoSchema.is_paid),
        is_tvseries: String(videoSchema.is_tvseries),
        release: videoSchema.release || "2000",
        runtime: String(videoSchema.runtime),
        video_quality: videoSchema.video_quality,
        thumbnail_url: videoSchema.thumbnail_url,
        poster_url: videoSchema.poster_url
      }))
    };

    return response;

  } catch (error) {
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