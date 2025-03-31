require("dotenv").config();
const axios = require("axios");

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;  // API Key from .env file
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;  // Your storage zone name
const BUNNY_BASE_URL = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}`;

// Axios instance for BunnyCDN
const bunnyAxios = axios.create({
    baseURL: BUNNY_BASE_URL,
    headers: {
        AccessKey: BUNNY_API_KEY,
        "Content-Type": "application/json",
    },
});

module.exports = bunnyAxios;
