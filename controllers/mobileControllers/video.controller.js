const videoService = require('../../services/mobileServices/video.service');

/**
 * GET /api/videos
 * Retrieve all videos.
 */
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await videoService.getAllVideos();
    return res.status(200).json({
      status: 'success',
      data: videos
    });
  } catch (error) {
    console.error('Error retrieving videos:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * POST /api/videos
 * Create a new video.
 * Expected request body: JSON object with video fields.
 */
exports.createVideo = async (req, res) => {
  try {
    const videoData = req.body;
    const newVideo = await videoService.createVideo(videoData);
    return res.status(201).json({
      status: 'success',
      data: newVideo
    });
  } catch (error) {
    console.error('Error creating video:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * GET /api/videos/:id
 * Retrieve a video by its ID.
 */
exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await videoService.getVideoById(id);
    if (!video) {
      return res.status(404).json({ status: 'error', message: 'Video not found' });
    }
    return res.status(200).json({
      status: 'success',
      data: video
    });
  } catch (error) {
    console.error('Error retrieving video:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * PUT /api/videos/:id
 * Update a video by its ID.
 */
exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedVideo = await videoService.updateVideo(id, updateData);
    if (!updatedVideo) {
      return res.status(404).json({ status: 'error', message: 'Video not found' });
    }
    return res.status(200).json({
      status: 'success',
      data: updatedVideo
    });
  } catch (error) {
    console.error('Error updating video:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * DELETE /api/videos/:id
 * Delete a video by its ID.
 */
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVideo = await videoService.deleteVideo(id);
    if (!deletedVideo) {
      return res.status(404).json({ status: 'error', message: 'Video not found' });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
