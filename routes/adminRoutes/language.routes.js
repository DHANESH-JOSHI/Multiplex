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
// router.post('/add', addLanguage);

// Get all languages
// router.get('/all', getAllLanguages);

// Get language by ID
// https://multiplexplay.com/nodeapi/rest-api/v130/content_by_genre_idl?id=1&page=1&lid=1&country=IN
router.get('/content_by_genre_idl', getLanguageById);


// Update language
// router.put('/update/:id', updateLanguage);

// Delete language
// router.delete('/delete/:id', deleteLanguage);

module.exports = router;