const express = require("express");
const router = express.Router();
const { firebaseAuth } = require("../../controllers/mobileControllers/userLogin.controller");

router.post("/", firebaseAuth);

module.exports = router;
