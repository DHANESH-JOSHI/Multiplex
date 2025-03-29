const express = require("express");
const router = express.Router();
const { login } = require("../controllers/mobileControllers/adminLogin.controller");

router.post("/", login);

module.exports = router;
