const express = require("express");
const router = express.Router();
const { login, registration } = require("../../controllers/multiplexPlayController/adminAuth.controller");

router.post("/login", login);
router.post("/register", registration);

module.exports = router;
