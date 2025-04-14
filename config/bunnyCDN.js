require("dotenv").config();
const axios = require("axios");

// Get the correct API key for Bunny Storage
const BUNNY_STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY;
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
const BUNNY_BASE_URL = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}`;

// Axios instance for BunnyCDN Storage
const bunnyAxios = axios.create({
    baseURL: BUNNY_BASE_URL,
    headers: {
        AccessKey: BUNNY_STORAGE_API_KEY,
        "Content-Type": "application/json",
    },
});

module.exports = bunnyAxios;
