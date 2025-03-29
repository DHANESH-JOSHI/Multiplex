const express = require("express");
const router = express.Router();
const { login, registration } = require("../controllers/mobileControllers/adminAuth.controller");

router.post("/login", login);
router.post("/register", registration);

module.exports = router;
