const BunnyCDNService = require("../../services/adminServices/bunnyCDN.service");

exports.listFiles = async (req, res) => {
    try {
        const { category, folderName, subFolder } = req.query;
        const directory = `/${category}/${folderName}/${subFolder || ""}`;
        const files = await BunnyCDNService.listFiles(directory);
        res.status(200).json({ message: "Files fetched successfully", data: files });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.uploadFile = async (req, res) => {
    try {
        const { category, folderName, subFolder, fileName } = req.body;
        const fileData = req.file.buffer; // Assuming file is sent via multer
        const result = await BunnyCDNService.uploadFile(category, folderName, subFolder, fileName, fileData);
        res.status(201).json({ message: "File uploaded successfully", data: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const { category, folderName, subFolder, fileName } = req.body;
        const result = await BunnyCDNService.deleteFile(category, folderName, subFolder, fileName);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
