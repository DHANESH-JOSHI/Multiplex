const configService = require('../../services/mobileServices/config.service');

exports.getFullConfig = async (req, res) => {
  try {
    const data = await configService.getFullConfig();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching config:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
