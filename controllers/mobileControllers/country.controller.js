const Country = require('../../models/country.model');

const getAllCountry = async (req, res) => {
    try {
        const countries = await Country.find({});
        res.status(200).json({
            success: true,
            message: 'All country details fetched successfully',
            data: countries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching country details',
            error: error.message
        });
    }
};

module.exports = { getAllCountry };
