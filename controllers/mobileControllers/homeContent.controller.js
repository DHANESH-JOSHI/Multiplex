const HomeContentService = require('../../services/mobileServices/homeContent.service');

const getHomeContentForAndroid = async (req, res) => {
  try {
    let country = req.query.country;
    const data = await HomeContentService.getHomeContent(country);
    res.json(data);
  } catch (err) {
    console.error('Error in HomeContentController:', err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getHomeContentForAndroid };