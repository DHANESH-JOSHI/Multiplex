const express = require("express");
const router = express.Router();
const { getAllCountry } = require('../../controllers/mobileControllers/country.controller');

router.get('/', getAllCountry);


module.exports = router;
