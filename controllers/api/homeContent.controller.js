const HomeContentService = require('../../services/api/homeContent.service');

const getHomeContentForAndroid = async (req, res) => {
  try {
    const data = await HomeContentService.getHomeContent();
    res.json(data);
  } catch (err) {
    console.error('Error in HomeContentController:', err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getHomeContentForAndroid };
