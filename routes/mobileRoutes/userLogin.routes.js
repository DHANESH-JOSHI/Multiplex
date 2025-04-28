const express = require("express");
const router = express.Router();
const { login, verifyOtp } = require("../../controllers/mobileControllers/userLogin.controller");

router.post("/", login);
router.post('/verify-otp', verifyOtp);

module.exports = router;
