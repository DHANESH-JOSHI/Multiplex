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

const getSingleMovieDetailsByIdc = async (id, uid) => {
  const videoObjectId = id;

  // Aggregation pipeline
  const video = await Video.aggregate([
    { $match: { _id: videoObjectId } },
    {
      $lookup: {
        from: 'channels',
        localField: 'imdbid',
        foreignField: 'channel_id',
        as: 'channel_info'
      }
    },
    {
      $addFields: {
        channel: { $arrayElemAt: ['$channel_info', 0] }
      }
    },
    {
      $project: {
        channel_info: 0
      }
    }
  ]);

  if (!video[0]) return {};

  const movie = video[0];

  // Subscription check
  let subscribed = 0;
  if (uid) {
    const sub = await Subscribe.findOne({ c_id: movie.imdbid, user_id: uid });
    if (sub) subscribed = 1;
  }

  // Update view counts
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
    channel_name: video.channel?.channel_name,
    channel_id: video.channel?.channel_id,
    channel_img: video.channel?.img,
    is_tvseries: '0',
    is_paid: video.is_paid,
    enable_download: video.enable_download,
    download_links: video.enable_download ? video.download_links || [] : [],
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
    trailler_youtube_source: video.trailler_youtube_source,
    related_movie: [] // Can add another aggregate call
  };
}
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