const express = require("express");
const router = express.Router();
const { search } = require("../../controllers/adminController/search.controller");

router.get("/", search);

module.exports = router;