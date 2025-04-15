const express = require("express");
const router = express.Router();
const { login, googleAuth, googleCallback } = require("../../controllers/webControllers/auth.controller");

// Regular login with email/mobile and password
router.post("/login", login);

// Google OAuth routes
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

module.exports = router;
