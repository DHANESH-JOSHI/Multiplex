const Country = require('../../models/country.model');

// Create a new country
const createCountry = async (req, res) => {
    try {
        const { name, code, description, slug, publication } = req.body;

        // Validate input fields
        if (!name || !code || !description || !slug || publication === undefined) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if slug already exists
        const existingSlug = await Country.findOne({ slug });
        if (existingSlug) {
            return res.status(400).json({
                success: false,
                message: 'Slug already exists'
            });
        }

        // Create a new country document
        const country = new Country({
            name,
            code,
            description,
            slug,
            publication
        });

        // Save the country document (country_id will auto-increment)
        const savedCountry = await country.save();

        res.status(201).json({
            success: true,
            message: 'Country created successfully',
            data: savedCountry
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating country',
            error: error.message
        });
    }
};

// Update country by country_id
const updateCountry = async (req, res) => {
    try {
        const { country_id } = req.params;
        const updateData = req.body;

        // Validate if slug exists and check for duplicates
        if (updateData.slug) {
            const existingSlug = await Country.findOne({
                slug: updateData.slug,
                country_id: { $ne: country_id }
            });

            if (existingSlug) {
                return res.status(400).json({
                    success: false,
                    message: 'Slug already exists'
                });
            }
        }

        // Update country document by country_id
        const updatedCountry = await Country.findOneAndUpdate(
            { country_id },
            updateData,
            { new: true, runValidators: true }
        );

        // Handle case if country is not found
        if (!updatedCountry) {
            return res.status(404).json({
                success: false,
                message: 'Country not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Country updated successfully',
            data: updatedCountry
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating country',
            error: error.message
        });
    }
};

// Delete country by country_id
const deleteCountry = async (req, res) => {
    try {
        const { country_id } = req.params;

        // Check if country exists before deleting
        const deletedCountry = await Country.findOneAndDelete({ country_id });

        if (!deletedCountry) {
            return res.status(404).json({
                success: false,
                message: 'Country not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Country deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting country',
            error: error.message
        });
    }
};

// Get all countries
const getAllCountries = async (req, res) => {
    try {
        const countries = await Country.find({});
        
        res.status(200).json({
            success: true,
            message: 'All countries fetched successfully',
            data: countries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching countries',
            error: error.message
        });
    }
};

// Get country by country_id
const getCountryByCode = async (req, res) => {
    try {
        const { code } = req.params;

        const country = await Country.findOne({ code });

        if (!country) {
            return res.status(404).json({
                success: false,
                message: 'Country not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Country details fetched successfully',
            data: country
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching country details',
            error: error.message
        });
    }
};

module.exports = { 
    createCountry, 
    updateCountry, 
    deleteCountry,
    getAllCountries,
    getCountryByCode
};
