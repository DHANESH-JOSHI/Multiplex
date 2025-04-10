const express = require("express");
const router = express.Router();
const { addSlider, getAllSliders, getSliderById, updateSlider, deleteSlider } = require("../../controllers/adminController/banner.controller");

router.post("/slider", addSlider);
router.get("/slider", getAllSliders);
router.get("/slider/:id", getSliderById);
router.put("/slider/:id", updateSlider);
router.delete("/slider/:id", deleteSlider);

module.exports = router;
