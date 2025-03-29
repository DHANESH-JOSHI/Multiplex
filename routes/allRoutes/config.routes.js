const express = require("express");
const router = express.Router();
const { getFullConfig } = require('../../controllers/api/config.controller');

router.get('/', getFullConfig);

module.exports = router;
