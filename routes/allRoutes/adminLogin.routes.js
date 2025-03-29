const express = require("express");
const router = express.Router();
const { login } = require("../../controllers/api/adminLogin.controller");

router.post("/", login);

module.exports = router;
