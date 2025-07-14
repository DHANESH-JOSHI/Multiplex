const HomeContentService = require('../../services/mobileServices/homeContent.service');

const getHomeContentForAndroid = async (req, res) => {
  try {
    let country = req.query.country;
    let channel_id = req.query.channel_id; // Add channel_id support
    let user_id = req.query.user_id; // Add user_id support for subscription check
    const data = await HomeContentService.getHomeContent(country, channel_id, user_id);
    res.json(data);
  } catch (err) {
    console.error('Error in HomeContentController:', err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getHomeContentForAndroid };