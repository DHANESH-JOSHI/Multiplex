const Video = require('../../models/videos.model');

/**
 * Retrieve all videos from the database.
 * @returns {Promise<Array>} An array of video objects.
 */
const getAllVideos = async () => {
  try {
    return await Video.find({}).sort({ cre: -1 }).lean();
  } catch (error) {
    throw new Error('Error retrieving videos: ' + error.message);
  }
};

/**
 * Create a new video.
 * @param {Object} videoData - Data for creating a new video.
 * @returns {Promise<Object>} The newly created video document.
 */
const createVideo = async (videoData) => {
  try {
    const video = new Video(videoData);
    return await video.save();
  } catch (error) {
    throw new Error('Error creating video: ' + error.message);
  }
};

/**
 * Retrieve a single video by its ID.
 * @param {String} id - The video document ID.
 * @returns {Promise<Object|null>} The video document, or null if not found.
 */
const getVideoById = async (id) => {
  try {
    return await Video.findById(id).lean();
  } catch (error) {
    throw new Error('Error retrieving video: ' + error.message);
  }
};

/**
 * Update a video by its ID.
 * @param {String} id - The video document ID.
 * @param {Object} updateData - Fields to update.
 * @returns {Promise<Object|null>} The updated video document, or null if not found.
 */
const updateVideo = async (id, updateData) => {
  try {
    return await Video.findByIdAndUpdate(id, updateData, { new: true }).lean();
  } catch (error) {
    throw new Error('Error updating video: ' + error.message);
  }
};

/**
 * Delete a video by its ID.
 * @param {String} id - The video document ID.
 * @returns {Promise<Object|null>} The deleted video document, or null if not found.
 */
const deleteVideo = async (id) => {
  try {
    return await Video.findByIdAndDelete(id).lean();
  } catch (error) {
    throw new Error('Error deleting video: ' + error.message);
  }
};

module.exports = {
  getAllVideos,
  createVideo,
  getVideoById,
  updateVideo,
  deleteVideo
};
