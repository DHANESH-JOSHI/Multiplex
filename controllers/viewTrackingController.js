const ViewTrackingService = require('../services/viewTracking.service');

const ViewTrackingController = {
  
  /**
   * Track video view - Call this when user starts watching video
   * POST /api/track-view
   */
  async trackView(req, res) {
    try {
      const { video_id } = req.body;
      const userId = req.user?.id || null; // From auth middleware
      const ipAddress = req.ip || req.connection.remoteAddress;

      if (!video_id) {
        return res.status(400).json({
          success: false,
          message: 'video_id is required'
        });
      }

      const viewCounted = await ViewTrackingService.trackView(video_id, userId, ipAddress);
      
      if (viewCounted) {
        return res.status(200).json({
          success: true,
          message: 'View tracked successfully'
        });
      } else {
        return res.status(200).json({
          success: true,
          message: 'View already counted today'
        });
      }

    } catch (error) {
      console.error('❌ Track view error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  /**
   * Get video view statistics
   * GET /api/view-stats/:videoId
   */
  async getViewStats(req, res) {
    try {
      const { videoId } = req.params;
      
      if (!videoId) {
        return res.status(400).json({
          success: false,
          message: 'videoId is required'
        });
      }

      const stats = await ViewTrackingService.getViewStats(videoId);
      
      return res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('❌ Get view stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  /**
   * Get top viewed videos
   * GET /api/top-videos?period=total&limit=10
   */
  async getTopVideos(req, res) {
    try {
      const { period = 'total', limit = 10 } = req.query;
      
      const validPeriods = ['today', 'weekly', 'monthly', 'total'];
      if (!validPeriods.includes(period)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid period. Valid values: today, weekly, monthly, total'
        });
      }

      const topVideos = await ViewTrackingService.getTopVideos(parseInt(limit), period);
      
      return res.status(200).json({
        success: true,
        data: topVideos
      });

    } catch (error) {
      console.error('❌ Get top videos error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  /**
   * Admin function - Reset view counts
   * POST /api/admin/reset-views
   */
  async resetViews(req, res) {
    try {
      const { type } = req.body; // 'daily', 'weekly', 'monthly'
      
      switch (type) {
        case 'daily':
          await ViewTrackingService.resetDailyViews();
          break;
        case 'weekly':
          await ViewTrackingService.resetWeeklyViews();
          break;
        case 'monthly':
          await ViewTrackingService.resetMonthlyViews();
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid type. Valid values: daily, weekly, monthly'
          });
      }

      return res.status(200).json({
        success: true,
        message: `${type} views reset successfully`
      });

    } catch (error) {
      console.error('❌ Reset views error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  /**
   * Admin function - Get cache statistics
   * GET /api/admin/cache-stats
   */
  async getCacheStats(req, res) {
    try {
      const stats = ViewTrackingService.getCacheStats();
      
      return res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('❌ Get cache stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  /**
   * Admin function - Clear view cache
   * POST /api/admin/clear-cache
   */
  async clearCache(req, res) {
    try {
      ViewTrackingService.clearCache();
      
      return res.status(200).json({
        success: true,
        message: 'Cache cleared successfully'
      });

    } catch (error) {
      console.error('❌ Clear cache error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = ViewTrackingController;
