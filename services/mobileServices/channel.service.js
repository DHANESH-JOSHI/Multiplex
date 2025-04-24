const Channel = require('../../models/channel.model');
const Video = require('../../models/videos.model');
const videoSchema = require('../../models/videos.model');
const Subscription = require('../../models/subcribe.model');

const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

const getChannelList = (limit, platform) => {
  return new Promise((resolve, reject) => {
    Channel.aggregate([
      {
        $match: { status: 'approve' }
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'user_id',
          foreignField: 'lid',
          as: 'videos'
        }
      },
      {
        $unwind: '$videos'
      },
      {
        $project: {
          channel_name: 1,
          channel_img: '$img',
          channel_id: { $toString: '$channel_id' },
          view: { $toString: '$videos.total_view' },
          videos_id: { $toString: '$videos.videos_id' },
          title: '$videos.title',
          description: '$videos.description',
          raw_release: '$videos.cre', // Raw date for JS formatting later
          is_paid: { $toString: '$videos.is_paid' },
          runtime: '$videos.runtime',
          video_quality: '$videos.video_quality',
          thumbnail_url: {
            $concat: [
              'https://multiplexplay.com/office/uploads/video_thumb/',
              { $toString: '$videos.videos_id' },
              '.jpg'
            ]
          },
          poster_url: {
            $concat: [
              'https://multiplexplay.com/office/uploads/poster_image/',
              { $toString: '$videos.videos_id' },
              '.jpg'
            ]
          },
          slug: {
            $concat: ['-', { $toString: '$videos.videos_id' }]
          }
        }
      },
      { $limit: limit || 10 }
    ])
      .then(result => {
        const formatted = result.map(item => ({
          ...item,
          release: item.raw_release ? dayjs(item.raw_release).fromNow() : '',
        }));
        resolve(formatted);
      })
      .catch(err => reject(err));
  });
};


const getChannelInfoService = async (channel_id, uid) => {
  try {
    // 🛡️ Step 1: Validate and Parse channel_id
    const parsedChannelId = parseInt(channel_id);
    const parsedUserId = parseInt(uid);

    if (isNaN(parsedChannelId)) {
      throw new Error("Invalid channel_id. Must be a number.");
    }

    // 🛡️ Step 2: Fetch channel details
    const channel = await Channel.findOne({ channel_id: parsedChannelId });

    if (!channel) {
      throw new Error("Channel not found.");
    }

    let stt = 0; // Subscription status

    // 🛡️ Step 3: Check subscription if user_id is provided
    if (parsedUserId > 0) {
      const subscription = await Subscription.find({ c_id: parsedChannelId, user_id: parsedUserId });
      if (subscription.length > 0) {
        stt = 1; // User is subscribed
      }
    }

    // 🛡️ Step 4: Get total views for the channel's videos
    const totalViews = await videoSchema.aggregate([
      { $match: { imdbid: parsedChannelId } },
      { $group: { _id: null, total_view: { $sum: "$total_view" } } }
    ]);

    const totalViewCount = totalViews.length > 0 ? totalViews[0].total_view : 0;

    // 🛡️ Step 5: Fetch the count of subscribers
    const subscriberCount = await Subscription.countDocuments({ c_id: parsedChannelId });

    // 🛡️ Step 6: Fetch related videos
    const relatedMovies = await videoSchema.aggregate([
      { $match: { imdbid: parsedChannelId, is_tvseries: { $ne: 1 }, publication: 1 } },
      { $limit: 10 }, // Adjust based on your needs
    ]);

    // 🛡️ Step 7: Prepare the response
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

module.exports = { getChannelInfoService };


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
  createChannel,
  updateChannel,
  deleteChannel,
  getChannelById
};