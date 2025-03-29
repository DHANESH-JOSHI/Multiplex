const express = require("express");
const router = express.Router();
const { getFullConfig } = require('../../controllers/mobileControllers/config.controller');

router.get('/', getFullConfig);

module.exports = router;
