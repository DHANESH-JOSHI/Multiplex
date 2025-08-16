const Video = require('../models/videos.model');
const mongoose = require('mongoose');

// In-memory cache for view tracking (Use Redis for production)
const viewCache = new Map();

const ViewTrackingService = {
  
  /**
   * Track video view with session management
   * Prevents duplicate counting for same user/IP on same day
   * @param {string} videoId - Video ID to track
   * @param {string} userId - User ID (optional)
   * @param {string} ipAddress - User IP address
   * @returns {Promise<boolean>} - Returns true if view was counted
   */
  async trackView(videoId, userId = null, ipAddress = null) {
    try {
      // Validate video ID
      if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        console.warn('❌ Invalid video ID for view tracking:', videoId);
        return false;
      }

      // Create unique identifier for session
      const today = new Date().toDateString(); // "Mon Jan 01 2024"
      const sessionKey = userId ? `user_${userId}` : `ip_${ipAddress}`;
      const viewKey = `${videoId}_${sessionKey}_${today}`;

      // Check if already viewed today
      if (viewCache.has(viewKey)) {
        console.log(`⏭️ Already viewed today: ${videoId} by ${sessionKey}`);
        return false;
      }

      // Check if video exists
      const video = await Video.findById(videoId);
      if (!video) {
        console.warn('❌ Video not found for view tracking:', videoId);
        return false;
      }

      // Increment view counts
      await Video.updateOne(
        { _id: videoId },
        {
          $inc: {
            today_view: 1,
            weekly_view: 1, 
            monthly_view: 1,
            total_view: 1
          }
        }
      );

      // Mark as viewed today (cache for 24 hours)
      viewCache.set(viewKey, true);
      
      // Optional: Clean cache periodically
      setTimeout(() => {
        viewCache.delete(viewKey);
      }, 24 * 60 * 60 * 1000); // 24 hours

      console.log(`✅ View counted for video: ${videoId} by ${sessionKey}`);
      return true;

    } catch (error) {
      console.error('❌ Error tracking view:', error);
      return false;
    }
  },

  /**
   * Get video view statistics
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} - View statistics
   */
  async getViewStats(videoId) {
    try {
      const video = await Video.findById(videoId).select('today_view weekly_view monthly_view total_view');
      
      if (!video) {
        return {
          today_view: 0,
          weekly_view: 0,
          monthly_view: 0,
          total_view: 0
        };
      }

      return {
        today_view: video.today_view || 0,
        weekly_view: video.weekly_view || 0,
        monthly_view: video.monthly_view || 0,
        total_view: video.total_view || 0
      };

    } catch (error) {
      console.error('❌ Error fetching view stats:', error);
      return {
        today_view: 0,
        weekly_view: 0,
        monthly_view: 0,
        total_view: 0
      };
    }
  },

  /**
   * Get top viewed videos
   * @param {number} limit - Number of videos to return
   * @param {string} period - 'today', 'weekly', 'monthly', 'total'
   * @returns {Promise<Array>} - Top viewed videos
   */
  async getTopVideos(limit = 10, period = 'total') {
    try {
      const sortField = `${period}_view`;
      
      const videos = await Video.find({})
        .select('title total_view today_view weekly_view monthly_view')
        .sort({ [sortField]: -1 })
        .limit(limit);

      return videos.map(video => ({
        video_id: video._id,
        title: video.title,
        views: video[sortField] || 0
      }));

    } catch (error) {
      console.error('❌ Error fetching top videos:', error);
      return [];
    }
  },

  /**
   * Reset daily view counts (Run this via cron job)
   */
  async resetDailyViews() {
    try {
      await Video.updateMany({}, { $set: { today_view: 0 } });
      console.log('✅ Daily views reset successfully');
    } catch (error) {
      console.error('❌ Error resetting daily views:', error);
    }
  },

  /**
   * Reset weekly view counts (Run this via cron job)
   */
  async resetWeeklyViews() {
    try {
      await Video.updateMany({}, { $set: { weekly_view: 0 } });
      console.log('✅ Weekly views reset successfully');
    } catch (error) {
      console.error('❌ Error resetting weekly views:', error);
    }
  },

  /**
   * Reset monthly view counts (Run this via cron job)
   */
  async resetMonthlyViews() {
    try {
      await Video.updateMany({}, { $set: { monthly_view: 0 } });
      console.log('✅ Monthly views reset successfully');
    } catch (error) {
      console.error('❌ Error resetting monthly views:', error);
    }
  },

  /**
   * Clear view cache (for testing or manual cleanup)
   */
  clearCache() {
    viewCache.clear();
    console.log('✅ View cache cleared');
  },

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: viewCache.size,
      cachedViews: Array.from(viewCache.keys())
    };
  }
};

module.exports = ViewTrackingService;
