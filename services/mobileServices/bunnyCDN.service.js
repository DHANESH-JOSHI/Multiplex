const bunnyAxios = require("../../config/bunnyCDN");

/**
 * List files from BunnyCDN
 * @param {Array} pathSegments - Array of path segments
 * @returns {Promise<Object>} - Response data
 */
const listFiles = async (pathSegments = []) => {
  try {
    if (!Array.isArray(pathSegments)) throw new Error("Path segments must be an array");
    const directory = "/" + pathSegments.join("/");
    const response = await bunnyAxios.get(directory);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching files from BunnyCDN: " + error.message);
  }
};

/**
 * Get file details from BunnyCDN
 * @param {Array} pathSegments - Array of path segments
 * @param {String} fileName - Name of the file
 * @returns {Promise<Object>} - File details
 */
const getFileDetails = async (pathSegments = [], fileName) => {
  try {
    if (!Array.isArray(pathSegments) || !fileName) {
      throw new Error("Invalid input: pathSegments and fileName are required");
    }

    const filePath = "/" + [...pathSegments, fileName].join("/");
    const response = await bunnyAxios.get(filePath);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching file details from BunnyCDN: " + error.message);
  }
};

/**
 * Upload file to BunnyCDN
 * @param {Array} pathSegments - Array of path segments
 * @param {String} fileName - Name of the file
 * @param {Buffer} fileData - File data buffer
 * @returns {Promise<Object>} - Upload response
 */
const uploadFile = async (pathSegments = [], fileName, fileData) => {
  try {
    if (!Array.isArray(pathSegments) || !fileName || !fileData) {
      throw new Error("Invalid input: pathSegments, fileName, and fileData are required");
    }

    const uploadPath = "/" + [...pathSegments, fileName].join("/");
    const response = await bunnyAxios.put(uploadPath, fileData, {
      headers: { "Content-Type": "application/octet-stream" },
    });

    return { 
      success: true, 
      message: "File uploaded successfully", 
      url: response.data.HttpUrl 
    };
  } catch (error) {
    return {
      success: false,
      message: "Error uploading file to BunnyCDN: " + error.message
    };
  }
};

/**
 * Delete file from BunnyCDN
 * @param {Array} pathSegments - Array of path segments
 * @param {String} fileName - Name of the file
 * @returns {Promise<Object>} - Delete response
 */
const deleteFile = async (pathSegments = [], fileName) => {
  try {
    if (!Array.isArray(pathSegments) || !fileName) {
      throw new Error("Invalid input: pathSegments and fileName are required");
    }

    const filePath = "/" + [...pathSegments, fileName].join("/");
    await bunnyAxios.delete(filePath);
    return { 
      success: true, 
      message: "File deleted successfully" 
    };
  } catch (error) {
    return {
      success: false,
      message: "Error deleting file from BunnyCDN: " + error.message
    };
  }
};

module.exports = {
  listFiles,
  getFileDetails,
  uploadFile,
  deleteFile
};
