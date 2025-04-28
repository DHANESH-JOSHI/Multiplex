const express = require("express");
const router = express.Router();
const { getFullConfig } = require('../../controllers/mobileControllers/config.controller');
const {cacheMiddleware} = require('../../middleware/nodeCache');

router.get('/',cacheMiddleware(3600),getFullConfig);

module.exports = router;