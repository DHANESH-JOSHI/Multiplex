const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const bunnyAxios = require("../../config/bunnyCDN");

class BunnyCDNService {
    // List files from BunnyCDN
    async listFiles(pathSegments = []) {
        try {
            if (!Array.isArray(pathSegments)) throw new Error("Path segments must be an array");
            const directory = "/" + pathSegments.join("/");
            const response = await bunnyAxios.get(directory);
            return response.data;
        } catch (error) {
            throw new Error("Error fetching files from BunnyCDN: " + error.message);
        }
    }

    // Upload video file to BunnyCDN
    async uploadVideo(pathSegments = [], filePath) {
        try {
            if (!Array.isArray(pathSegments) || !filePath) {
                throw new Error("Invalid input: pathSegments and filePath are required");
            }

            const fileName = path.basename(filePath);
            const fileMimeType = mime.lookup(filePath) || "application/octet-stream";
            const fileStream = fs.createReadStream(filePath);
            
            const uploadPath = "/" + [...pathSegments, fileName].join("/");
            
            const response = await bunnyAxios.put(uploadPath, fileStream, {
                headers: { "Content-Type": fileMimeType },
            });

            return { message: "Video uploaded successfully", url: response.data.HttpUrl };
        } catch (error) {
            throw new Error("Error uploading video to BunnyCDN: " + error.message);
        }
    }

    // Get single file details
    async getFileDetails(pathSegments = [], fileName) {
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
    }

    // Delete file from BunnyCDN
    async deleteFile(pathSegments = [], fileName) {
        try {
            if (!Array.isArray(pathSegments) || !fileName) {
                throw new Error("Invalid input: pathSegments and fileName are required");
            }

            const filePath = "/" + [...pathSegments, fileName].join("/");
            await bunnyAxios.delete(filePath);
            return { message: "File deleted successfully" };
        } catch (error) {
            throw new Error("Error deleting file from BunnyCDN: " + error.message);
        }
    }
}

module.exports = new BunnyCDNService();
