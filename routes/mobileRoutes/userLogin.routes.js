const express = require("express");
const router = express.Router();
const { login, verifyOtp, firebaseAuth } = require("../../controllers/mobileControllers/userLogin.controller");

router.post("/", login);
router.post('/verify-otp', verifyOtp);
router.post('/firebase_auth', firebaseAuth);

module.exports = router;
