const express = require("express");
const router = express.Router();
const { login } = require("../../controllers/api/user.controller");

router.post("/login", login);

module.exports = router;
