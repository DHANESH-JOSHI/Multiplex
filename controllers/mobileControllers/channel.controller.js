const { getChannelList, getChannelInfoService, createChannel, updateChannel, deleteChannel, getChannelById, getSingleMovieDetailsByIdc } = require('../../services/mobileServices/channel.service');


const getChannelListController = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 0;
    let channel;
    channel = await getChannelList();
    console.log(channel);
    res.json(channel);
  } catch (error) {
    console.error('Error fetching channel list:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// const getChannelInfoController = async (req, res) => {
//   try {
//     const { channel_id, uid } = req.query;

//     // 🛡️ Step 1: Validate and Parse channel_id
//     const parsedChannelId = parseInt(channel_id);
//     const parsedUserId = parseInt(uid);

//     if (isNaN(parsedChannelId)) {
//       return res.status(400).json({ error: "Invalid channel_id. Must be a number." });
//     }

//     // 🛡️ Step 2: Fetch channel details
//     const channel = await Channel.findOne({ channel_id: parsedChannelId });

//     if (!channel) {
//       return res.status(404).json({ error: "Channel not found." });
//     }

//     let stt = 0; // Subscription status

//     // 🛡️ Step 3: Check subscription if user_id is provided
//     if (parsedUserId > 0) {
//       const subscription = await Subscription.find({ c_id: parsedChannelId, user_id: parsedUserId });
//       if (subscription.length > 0) {
//         stt = 1; // User is subscribed
//       }
//     }

//     // 🛡️ Step 4: Get total views for the channel's videos
//     const totalViews = await videoSchema.aggregate([
//       { $match: { imdbid: parsedChannelId } },
//       { $group: { _id: null, total_view: { $sum: "$total_view" } } }
//     ]);

//     const totalViewCount = totalViews.length > 0 ? totalViews[0].total_view : 0;

//     // 🛡️ Step 5: Fetch the count of subscribers
//     const subscriberCount = await Subscription.countDocuments({ c_id: parsedChannelId });

//     // 🛡️ Step 6: Fetch related videos
//     const relatedMovies = await videoSchema.aggregate([
//       { $match: { imdbid: parsedChannelId, is_tvseries: { $ne: 1 }, publication: 1 } },
//       { $limit: 10 }, // Adjust based on your needs
//     ]);

//     // 🛡️ Step 7: Prepare the response
//     const response = {
//       channel_name: channel.channel_name,
//       channel_id: String(channel.channel_id),
//       channel_img: channel.img || 'https://multiplexplay.com/office/uploads/default_image/poster.jpg',
//       subcribe: stt,
//       view: String(totalViewCount),
//       count: String(subscriberCount),
//       related_movie: relatedMovies.map(videoSchema => ({
//         videos_id: String(videoSchema.videos_id),
//         genre: videoSchema.genre || null,
//         country: videoSchema.country || null,
//         channel_name: channel.channel_name,
//         channel_id: String(channel.channel_id),
//         channel_img: channel.img,
//         title: videoSchema.title,
//         view: String(videoSchema.total_view || 0),
//         description: videoSchema.description || "",
//         slug: `-${videoSchema.videos_id}`,
//         is_paid: String(videoSchema.is_paid),
//         is_tvseries: String(videoSchema.is_tvseries),
//         release: videoSchema.release || "2000",
//         runtime: String(videoSchema.runtime),
//         video_quality: videoSchema.video_quality,
//         thumbnail_url: videoSchema.thumbnail_url,
//         poster_url: videoSchema.poster_url
//       }))
//     };

//     // 🛡️ Step 8: Send the response
//     res.status(200).json(response);

//   } catch (error) {
//     console.error("getChannelInfoController Error:", error);
//     res.status(500).json({ error: "Something went wrong on the server." });
//   }
// };
const getChannelInfoController = async (req, res) => {
  try {
    const { channel_id, uid } = req.query;
    console.log(channel_id, uid);
    // Call the service method
    const response = await getChannelInfoService(channel_id, uid);

    // Return the response from the service
    res.status(200).json(response);

  } catch (error) {
    console.error("getChannelInfoController Error:", error);
    res.status(500).json({ error: error.message || "Something went wrong on the server." });
  }
};


const getChannelVideo = async (req, res) => {
  try {
    const { id, uid } = req.query;

    const data = await getSingleMovieDetailsByIdc(id, uid);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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
  getChannelVideo,
  createChannelController,
  updateChannelController,
  deleteChannelController,
  statusChannelController
};