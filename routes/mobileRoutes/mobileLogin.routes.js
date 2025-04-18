const express = require("express");
const router = express.Router();
const { mobileLogin } = require("../../controllers/mobileControllers/mobileLogin.controller");

router.post("/login", mobileLogin);

module.exports = router;
