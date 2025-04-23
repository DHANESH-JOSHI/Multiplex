const Channel = require('../../models/channel.model');
const Video = require('../../models/videos.model');
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