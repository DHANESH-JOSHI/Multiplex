const { getChannelList, createChannel, updateChannel, deleteChannel } = require('../../services/mobileServices/channel.service');

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

module.exports = { 
    getChannelListController,
    createChannelController,
    updateChannelController,
    deleteChannelController
};