const express = require("express");
const router = express.Router();
const { getAllCountries, 
        createCountry,
        getCountryByCode,
        // getSingleCountry,
        updateCountry,
        deleteCountry
        } = require('../../controllers/mobileControllers/country.controller');

// Create New Country 
router.post('/', createCountry);

// Get all countries
router.get('/', getAllCountries);

// Get single by country_id
// router.get('/:country_id', getSingleCountry);

// Get single by country Code 
router.get('/code/:code', getCountryByCode);

// Update
router.put('/:country_id', updateCountry);

// Delete
router.delete('/:country_id', deleteCountry);



module.exports = router;
