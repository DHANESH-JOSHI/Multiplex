const express = require("express");
const router = express.Router();
const { getStatus, updatestatus } = require("../../controllers/adminController/status.controller");

router.get("/", getStatus);
router.post("/:id", updatestatus);

module.exports = router;
