const express = require("express");
const router = express.Router();
const { login } = require("../../controllers/mobileControllers/userLogin.controller");

router.post("/login", login);

module.exports = router;
