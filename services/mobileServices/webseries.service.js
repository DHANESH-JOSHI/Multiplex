const Video = require('../../models/videos.model');
const Episode = require('../../models/episodes.model');
const Season = require('../../models/seasons.model');
const bunnyService = require('./bunnyCDN.service');

/**
 * Fetch all web series
 * @returns {Promise<Array>} Array of web series
 */
const getAllWebseries = async () => {
  try {
    // Get web series from database
    const webseries = await Video.find({ is_tvseries: 1 }).populate('director writer country genre');
    
    // Try to get additional info from Bunny CDN for each web series
    const enhancedWebseries = await Promise.all(webseries.map(async (series) => {
      try {
        // Try to get file details from Bunny CDN
        const bunnyData = await bunnyService.getFileDetails(['webseries'], series.videos_id.toString());
        return {
          ...series.toObject(),
          bunny_url: bunnyData.HttpUrl || null,
          file_size: bunnyData.Length || null,
          last_changed: bunnyData.LastChanged || null
        };
      } catch (error) {
        // If Bunny CDN data not available, return original series
        return series.toObject();
      }
    }));
    
    return enhancedWebseries;
  } catch (error) {
    throw new Error(`Error fetching web series: ${error.message}`);
  }
};

/**
 * Fetch a web series by ID
 * @param {string|number} id - Web series ID
 * @returns {Promise<Object>} Web series object with seasons and episodes
 */
const getWebseriesById = async (id) => {
  try {
    // Get web series from database
    const webseries = await Video.findOne({ videos_id: id, is_tvseries: 1 }).populate('director writer country genre');
    
    if (!webseries) {
      throw new Error('Web series not found');
    }
    
    // Get seasons for this web series
    const seasons = await Season.find({ video: webseries._id }).sort({ order: 1 });
    
    // Get episodes for each season
    const seasonsWithEpisodes = await Promise.all(seasons.map(async (season) => {
      const episodes = await Episode.find({ season: season._id }).sort({ order: 1 });
      
      // Try to get Bunny CDN data for each episode
      const enhancedEpisodes = await Promise.all(episodes.map(async (episode) => {
        try {
          const bunnyData = await bunnyService.getFileDetails(
            ['webseries', webseries.videos_id.toString(), season.seasons_id.toString()], 
            episode.episodes_id.toString()
          );
          return {
            ...episode.toObject(),
            bunny_url: bunnyData.HttpUrl || null,
            file_size: bunnyData.Length || null,
            last_changed: bunnyData.LastChanged || null
          };
        } catch (error) {
          return episode.toObject();
        }
      }));
      
      return {
        ...season.toObject(),
        episodes: enhancedEpisodes
      };
    }));
    
    // Try to get additional info from Bunny CDN for the web series
    try {
      const bunnyData = await bunnyService.getFileDetails(['webseries'], id.toString());
      return {
        ...webseries.toObject(),
        bunny_url: bunnyData.HttpUrl || null,
        file_size: bunnyData.Length || null,
        last_changed: bunnyData.LastChanged || null,
        seasons: seasonsWithEpisodes
      };
    } catch (error) {
      // If Bunny CDN data not available, return without it
      return {
        ...webseries.toObject(),
        seasons: seasonsWithEpisodes
      };
    }
  } catch (error) {
    throw new Error(`Error fetching web series: ${error.message}`);
  }
};

/**
 * Create a new web series
 * @param {Object} seriesData - Web series data
 * @param {Buffer} fileData - Optional file data to upload to Bunny CDN
 * @returns {Promise<Object>} Created web series
 */
const createWebseries = async (seriesData, fileData = null) => {
  try {
    // Check if web series already exists
    const existingWebseries = await Video.findOne({ videos_id: seriesData.videos_id });
    if (existingWebseries) {
      throw new Error('Web series with this ID already exists');
    }
    
    // If file data provided, upload to Bunny CDN
    if (fileData) {
      const uploadResult = await bunnyService.uploadFile(['webseries'], seriesData.videos_id.toString(), fileData);
      if (!uploadResult.success) {
        throw new Error(`Failed to upload to Bunny CDN: ${uploadResult.message}`);
      }
      
      // Add Bunny CDN URL to web series data
      seriesData.file_url = uploadResult.url;
    }
    
    // Create web series in database
    const webseries = new Video({
      ...seriesData,
      is_tvseries: 1 // Ensure it's marked as a TV series
    });
    
    return await webseries.save();
  } catch (error) {
    throw new Error(`Error creating web series: ${error.message}`);
  }
};

/**
 * Update a web series by ID
 * @param {string|number} id - Web series ID
 * @param {Object} seriesData - Updated web series data
 * @param {Buffer} fileData - Optional file data to upload to Bunny CDN
 * @returns {Promise<Object>} Updated web series
 */
const updateWebseries = async (id, seriesData, fileData = null) => {
  try {
    // Check if web series exists
    const webseries = await Video.findOne({ videos_id: id, is_tvseries: 1 });
    if (!webseries) {
      throw new Error('Web series not found');
    }
    
    // If file data provided, upload to Bunny CDN
    if (fileData) {
      const uploadResult = await bunnyService.uploadFile(['webseries'], id.toString(), fileData);
      if (!uploadResult.success) {
        throw new Error(`Failed to upload to Bunny CDN: ${uploadResult.message}`);
      }
      
      // Add Bunny CDN URL to web series data
      seriesData.file_url = uploadResult.url;
    }
    
    // Update web series in database
    return await Video.findOneAndUpdate(
      { videos_id: id },
      seriesData,
      { new: true }
    ).populate('director writer country genre');
  } catch (error) {
    throw new Error(`Error updating web series: ${error.message}`);
  }
};

/**
 * Delete a web series by ID
 * @param {string|number} id - Web series ID
 * @returns {Promise<Object>} Deleted web series
 */
const deleteWebseries = async (id) => {
  try {
    // Check if web series exists
    const webseries = await Video.findOne({ videos_id: id, is_tvseries: 1 });
    if (!webseries) {
      throw new Error('Web series not found');
    }
    
    // Get seasons for this web series
    const seasons = await Season.find({ video: webseries._id });
    
    // Delete episodes and seasons from Bunny CDN and database
    for (const season of seasons) {
      // Get episodes for this season
      const episodes = await Episode.find({ season: season._id });
      
      // Delete each episode from Bunny CDN and database
      for (const episode of episodes) {
        try {
          await bunnyService.deleteFile(
            ['webseries', webseries.videos_id.toString(), season.seasons_id.toString()], 
            episode.episodes_id.toString()
          );
        } catch (error) {
          console.error(`Failed to delete episode from Bunny CDN: ${error.message}`);
          // Continue with database deletion even if Bunny CDN deletion fails
        }
        
        await Episode.findByIdAndDelete(episode._id);
      }
      
      // Delete season from Bunny CDN
      try {
        await bunnyService.deleteFile(
          ['webseries', webseries.videos_id.toString()], 
          season.seasons_id.toString()
        );
      } catch (error) {
        console.error(`Failed to delete season from Bunny CDN: ${error.message}`);
        // Continue with database deletion even if Bunny CDN deletion fails
      }
      
      await Season.findByIdAndDelete(season._id);
    }
    
    // Try to delete web series from Bunny CDN
    try {
      await bunnyService.deleteFile(['webseries'], id.toString());
    } catch (error) {
      console.error(`Failed to delete web series from Bunny CDN: ${error.message}`);
      // Continue with database deletion even if Bunny CDN deletion fails
    }
    
    // Delete web series from database
    return await Video.findOneAndDelete({ videos_id: id });
  } catch (error) {
    throw new Error(`Error deleting web series: ${error.message}`);
  }
};

/**
 * Add a season to a web series
 * @param {string|number} seriesId - Web series ID
 * @param {Object} seasonData - Season data
 * @param {Buffer} fileData - Optional file data to upload to Bunny CDN
 * @returns {Promise<Object>} Created season
 */
const addSeason = async (seriesId, seasonData, fileData = null) => {
  try {
    // Check if web series exists
    const webseries = await Video.findOne({ videos_id: seriesId, is_tvseries: 1 });
    if (!webseries) {
      throw new Error('Web series not found');
    }
    
    // Check if season already exists
    const existingSeason = await Season.findOne({ 
      seasons_id: seasonData.seasons_id,
      video: webseries._id 
    });
    
    if (existingSeason) {
      throw new Error('Season with this ID already exists for this web series');
    }
    
    // If file data provided, upload to Bunny CDN
    if (fileData) {
      const uploadResult = await bunnyService.uploadFile(
        ['webseries', seriesId.toString()], 
        seasonData.seasons_id.toString(), 
        fileData
      );
      
      if (!uploadResult.success) {
        throw new Error(`Failed to upload to Bunny CDN: ${uploadResult.message}`);
      }
      
      // Add Bunny CDN URL to season data
      seasonData.file_url = uploadResult.url;
    }
    
    // Create season in database
    const season = new Season({
      ...seasonData,
      video: webseries._id
    });
    
    return await season.save();
  } catch (error) {
    throw new Error(`Error adding season: ${error.message}`);
  }
};

/**
 * Add an episode to a season
 * @param {string|number} seriesId - Web series ID
 * @param {string|number} seasonId - Season ID
 * @param {Object} episodeData - Episode data
 * @param {Buffer} fileData - Optional file data to upload to Bunny CDN
 * @returns {Promise<Object>} Created episode
 */
const addEpisode = async (seriesId, seasonId, episodeData, fileData = null) => {
  try {
    // Check if web series exists
    const webseries = await Video.findOne({ videos_id: seriesId, is_tvseries: 1 });
    if (!webseries) {
      throw new Error('Web series not found');
    }
    
    // Check if season exists
    const season = await Season.findOne({ 
      seasons_id: seasonId,
      video: webseries._id 
    });
    
    if (!season) {
      throw new Error('Season not found');
    }
    
    // Check if episode already exists
    const existingEpisode = await Episode.findOne({ 
      episodes_id: episodeData.episodes_id,
      season: season._id 
    });
    
    if (existingEpisode) {
      throw new Error('Episode with this ID already exists for this season');
    }
    
    // If file data provided, upload to Bunny CDN
    if (fileData) {
      const uploadResult = await bunnyService.uploadFile(
        ['webseries', seriesId.toString(), seasonId.toString()], 
        episodeData.episodes_id.toString(), 
        fileData
      );
      
      if (!uploadResult.success) {
        throw new Error(`Failed to upload to Bunny CDN: ${uploadResult.message}`);
      }
      
      // Add Bunny CDN URL to episode data
      episodeData.file_url = uploadResult.url;
    }
    
    // Create episode in database
    const episode = new Episode({
      ...episodeData,
      video: webseries._id,
      season: season._id
    });
    
    return await episode.save();
  } catch (error) {
    throw new Error(`Error adding episode: ${error.message}`);
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
