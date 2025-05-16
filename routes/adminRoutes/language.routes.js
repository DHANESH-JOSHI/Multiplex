
const express = require('express');
const router = express.Router();
const {
        addLanguage,
        getAllLanguages,
        getLanguageById,
        updateLanguage,
        deleteLanguage,
    } = require('../../controllers/adminController/language.controller');

// Add new language
router.post('/add', addLanguage);

// Get all languages
router.get('/all', getAllLanguages);

// Get language by ID
router.get('/get', getLanguageById);

// Update language
router.put('/update/:id', updateLanguage);

// Delete language
router.delete('/delete/:id', deleteLanguage);

module.exports = router;
