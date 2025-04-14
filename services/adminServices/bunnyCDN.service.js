require('dotenv').config();
const axios = require('axios');

/**
 * Create a new video in Bunny Stream API
 * @param {Object} videoData - Video data to create
 * @returns {Promise<Object>} - Response from Bunny API
 */
exports.BunnyService = async (config) => {
    try {
        console.log(config);
        const response = await axios(config);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Error creating video in Bunny API:', error.message);
        return {
            success: false,
            error: error.message,
            message: 'Failed to create video in Bunny API'
        };
    }
};