const Channel = require('../../models/channel.model');
const Video = require('../../models/videos.model');

// Get all channels with optional limit
const getChannelList = async (limit, platform) => {
  let query = Channel.find();
  if (limit > 0) {
    query = query.limit(limit);
  }

  let androidChannels = [];
  let iosChannels = [];

  if (platform === 'android' || platform === 'ios') {
    query = query.where({ platform: platform });
  }

  query = query.populate({
    path: 'video',
    select: 'videos_id title description slug release is_paid runtime video_quality thumbnail_url poster_url'
  });

  const channels = await query.lean();

  const mappedChannels = channels.map(channel => ({
    channel_name: channel.channel_name,
    channel_img: channel.img,
    channel_id: channel.channel_id,
    view: channel.view ? channel.view.toString() : "0",
    videos_id: channel.video ? channel.video.videos_id : "",
    title: channel.video ? channel.video.title : "",
    description: channel.video ? channel.video.description : "",
    slug: channel.video ? channel.video.slug : "",
    release: channel.video ? channel.video.release : "",
    is_paid: channel.video ? channel.video.is_paid.toString() : "",
    runtime: channel.video ? channel.video.runtime : "",
    video_quality: channel.video ? channel.video.video_quality : "",
    thumbnail_url: channel.video ? channel.video.thumbnail_url : "",
    poster_url: channel.video ? channel.video.poster_url : ""
  }));

  if (platform === 'android') {
    androidChannels = mappedChannels;
  } else if (platform === 'ios') {
    iosChannels = mappedChannels;
  }

  return {
    android: androidChannels,
    ios: iosChannels
  };
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
  return await Channel.findById(channelId).populate('video');
};

module.exports = {
  getChannelList,
  createChannel,
  updateChannel,
  deleteChannel,
  getChannelById
};