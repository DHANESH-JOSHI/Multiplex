const express = require('express');
const router = express.Router();
const ViewTrackingController = require('../controllers/viewTrackingController');

// Public routes
router.post('/track-view', ViewTrackingController.trackView);
router.get('/view-stats/:videoId', ViewTrackingController.getViewStats);
router.get('/top-videos', ViewTrackingController.getTopVideos);

// Admin routes (add authentication middleware as needed)
router.post('/admin/reset-views', ViewTrackingController.resetViews);
router.get('/admin/cache-stats', ViewTrackingController.getCacheStats);
router.post('/admin/clear-cache', ViewTrackingController.clearCache);

module.exports = router;
