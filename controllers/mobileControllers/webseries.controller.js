const webseriesService = require('../../services/mobileServices/webseries.service');

/**
 * Get all web series
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllWebseries = async (req, res) => {
  try {
    const webseries = await webseriesService.getAllWebseries();
    res.status(200).json({
      status: 'success',
      data: webseries
    });
  } catch (error) {
    console.error('Error fetching web series:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Get a single web series by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getWebseriesById = async (req, res) => {
  try {
    const webseries = await webseriesService.getWebseriesById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: webseries
    });
  } catch (error) {
    console.error(`Error fetching web series ${req.params.id}:`, error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ status: 'error', message: error.message });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Create a new web series
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createWebseries = async (req, res) => {
  try {
    // Check for required fields
    const { videos_id, title } = req.body;
    if (!videos_id || !title) {
      return res.status(400).json({
        status: 'error',
        message: 'videos_id and title are required'
      });
    }

    // Get file data if available
    const fileData = req.file ? req.file.buffer : null;
    
    // Create web series
    const webseries = await webseriesService.createWebseries(req.body, fileData);
    
    res.status(201).json({
      status: 'success',
      message: 'Web series created successfully',
      data: webseries
    });
  } catch (error) {
    console.error('Error creating web series:', error);
    if (error.message.includes('already exists')) {
      return res.status(409).json({ status: 'error', message: error.message });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Update a web series by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateWebseries = async (req, res) => {
  try {
    // Get file data if available
    const fileData = req.file ? req.file.buffer : null;
    
    // Update web series
    const webseries = await webseriesService.updateWebseries(req.params.id, req.body, fileData);
    
    res.status(200).json({
      status: 'success',
      message: 'Web series updated successfully',
      data: webseries
    });
  } catch (error) {
    console.error(`Error updating web series ${req.params.id}:`, error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ status: 'error', message: error.message });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Delete a web series by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteWebseries = async (req, res) => {
  try {
    await webseriesService.deleteWebseries(req.params.id);
    
    res.status(200).json({
      status: 'success',
      message: 'Web series deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting web series ${req.params.id}:`, error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ status: 'error', message: error.message });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Add a season to a web series
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addSeason = async (req, res) => {
  try {
    // Check for required fields
    const { seasons_id, seasons_name } = req.body;
    if (!seasons_id || !seasons_name) {
      return res.status(400).json({
        status: 'error',
        message: 'seasons_id and seasons_name are required'
      });
    }

    // Get file data if available
    const fileData = req.file ? req.file.buffer : null;
    
    // Add season
    const season = await webseriesService.addSeason(req.params.id, req.body, fileData);
    
    res.status(201).json({
      status: 'success',
      message: 'Season added successfully',
      data: season
    });
  } catch (error) {
    console.error(`Error adding season to web series ${req.params.id}:`, error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ status: 'error', message: error.message });
    }
    if (error.message.includes('already exists')) {
      return res.status(409).json({ status: 'error', message: error.message });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Add an episode to a season
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addEpisode = async (req, res) => {
  try {
    // Check for required fields
    const { episodes_id, episodes_name } = req.body;
    if (!episodes_id || !episodes_name) {
      return res.status(400).json({
        status: 'error',
        message: 'episodes_id and episodes_name are required'
      });
    }

    // Get file data if available
    const fileData = req.file ? req.file.buffer : null;
    
    // Add episode
    const episode = await webseriesService.addEpisode(
      req.params.id, 
      req.params.seasonId, 
      req.body, 
      fileData
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Episode added successfully',
      data: episode
    });
  } catch (error) {
    console.error(`Error adding episode to season ${req.params.seasonId}:`, error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ status: 'error', message: error.message });
    }
    if (error.message.includes('already exists')) {
      return res.status(409).json({ status: 'error', message: error.message });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { 
  getAllWebseries, 
  getWebseriesById, 
  createWebseries, 
  updateWebseries, 
  deleteWebseries,
  addSeason,
  addEpisode
};
