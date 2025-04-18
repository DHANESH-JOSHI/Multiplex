const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createSlider, getAllSliders, getSliderById, updateSlider, deleteSlider } = require('../../controllers/adminController/slider.controller');

// Setup multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // make sure this folder exists
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// Create with file upload (field name: image_file)
router.post('/', upload.single('image_file'), createSlider);
// Read All
router.get('/', getAllSliders);
// Read by ID
router.get('/:id', getSliderById);
// Update
router.put('/:id', upload.single('image_file'), updateSlider);
// Delete
router.delete('/:id', deleteSlider);

module.exports = router;
