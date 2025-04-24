const { getChannelList, createChannel, updateChannel, deleteChannel, getChannelById } = require('../../services/mobileServices/channel.service');
const videoSchema = require('../../models/videos.model');
const Channel = require('../../models/channel.model');
const Subscription = require('../../models/subcribe.model'); // or Subcribe if that's the actual name


const getChannelListController = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 0;
    const platformFromHeader = req.headers['x-platform'];
    let channel;

    if (platformFromHeader === 'android') {
      channel = await getChannelList(limit, 'android');
    } else if (platformFromHeader === 'ios') {
      channel = await getChannelList(limit, 'ios');
    } else {
      channel = await getChannelList(limit);
    }

    res.json(channel);
  } catch (error) {
    console.error('Error fetching channel list:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getChannelInfoController = async (req, res) => {

  const { cid, user_id } = req.query;
  let channel_id = cid;
  let userId = user_id;
  // const channel_id = parseInt(cid);
  const channel = await Channel.findOne({ channel_id });
  console.log(channel);
  if (!channel) return res.status(404).json({ error: 'Channel not found' });
  console.log(channel);
  const videos = await videoSchema.aggregate([
    { $match: { imdbid: String(channel_id) } },
    {
      $project: {
        videos_id: 1,
        genre: null,
        country: null,
        channel_name: channel.channel_name,
        channel_id: channel.channel_id,
        channel_img: channel.img,
        channelImage: channel.img,
        title: 1,
        view: "$total_view",
        description: 1,
        slug: {
          $concat: ["-", { $toString: "$videos_id" }]
        },
        is_paid: { $toString: "$is_paid" },
        is_tvseries: { $toString: "$is_tvseries" },
        release: {
          $cond: {
            if: "$cre",
            then: {
              $concat: [
                {
                  $toString: {
                    $floor: {
                      $divide: [
                        { $subtract: [new Date(), "$cre"] },
                        1000 * 60 * 60 * 24 * 30
                      ]
                    }
                  }
                },
                " month(s) ago "
              ]
            },
            else: ""
          }
        },
        runtime: 1,
        video_quality: 1,
        thumbnail_url: {
          $concat: [
            "https://multiplexplay.com/office/uploads/video_thumb/",
            { $toString: "$videos_id" },
            ".jpg"
          ]
        },
        poster_url: {
          $concat: [
            "https://multiplexplay.com/office/uploads/poster_image/",
            { $toString: "$videos_id" },
            ".jpg"
          ]
        }
      }
    }
  ]);
  console.log(videos);
  const totalViews = await videoSchema.aggregate([
    { $match: { imdbid: String(channel_id) } },
    { $group: { _id: null, total: { $sum: "$total_view" } } }
  ]);

  const isSubscribed = await Subscription.findOne({
    user_id: String(userId),
    c_id: channel_id
  });

  const subscriberCount = await Subscription.countDocuments({
    c_id: channel_id
  });

  res.send({
    channel_name: channel.channel_name,
    channel_id: String(channel.channel_id),
    channel_img: channel.img,
    subcribe: isSubscribed ? 1 : 0,
    view: String(totalViews[0]?.total || 0),
    count: String(subscriberCount),
    related_movie: videos
  });
}

const createChannelController = async (req, res) => {
  try {
    const channelData = req.body;
    const newChannel = await createChannel(channelData);
    res.status(201).json(newChannel);
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateChannelController = async (req, res) => {
  try {
    const { id } = req.params;
    const channelData = req.body;
    const updatedChannel = await updateChannel(id, channelData);
    if (!updatedChannel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    res.json(updatedChannel);
  } catch (error) {
    console.error('Error updating channel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteChannelController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteChannel(id);
    if (!result) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting channel:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const statusChannelController = async (req, res) => {
  try {
    const { channel_id, status } = req.body;
    // Check if status is valid
    const validStatuses = ['pending', 'approve', 'rejected', 'block'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    // Check identifier
    if (!channel_id) {
      return res.status(400).json({ message: 'channel_id is required.' });
    }

    // Find channel
    const channel = await getChannelById(channel_id);

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found.' });
    }

    // Update status
    channel.status = status;
    await channel.save();

    res.status(200).json({ message: 'Channel status updated successfully.', channel });

  } catch (err) {
    console.error('Error updating channel status:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getChannelListController,
  getChannelInfoController,
  createChannelController,
  updateChannelController,
  deleteChannelController,
  statusChannelController
};