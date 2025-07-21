
const videosModel = require("../../models/videos.model");
const LanguageService = require("../../services/adminServices/language.service");

class LanguageController {
    // Add a new language
    async addLanguage(req, res) {
        try {
            const { name, code } = req.body;
            try {
                const language = await LanguageService.addLanguage({ name, code });
                res.json({ success: true, language });
            } catch (err) {
                res.status(400).json({ message: err.message });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Get all languages
    async getAllLanguages(req, res) {
        try {
            const result = await LanguageService.getAllLanguages(req.query);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

//     async getVideosByLanguage(req, res) {
 
// }

    // Get language by ID
    async getLanguageById(req, res) {
    try {
        const languageId = req.query.lid;
        const VenderCheck = req.query.id;

        if (!languageId) {
        return res.status(400).json({ message: "Language ID is required" });
        }

        let videos = [];

        if (VenderCheck === "1") {
        videos = await videosModel.find({
            language: { $in: [languageId] },
            isChannel: false,
            is_movie: false,
        });
        } else if (VenderCheck === "2") {
        videos = await videosModel.find({
            language: { $in: [languageId] },
            isChannel: true,
            is_movie: true,
        });
        }

        res.status(200).json({
        message: "Videos fetched successfully",
        data: videos,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
        message: "Server error",
        error: error.message,
        });
    }
    }

    // Update language
    async updateLanguage(req, res) {
        try {
            const result = await LanguageService.updateLanguage(req.params.id, req.body);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Delete language
    async deleteLanguage(req, res) {
        try {
            const result = await LanguageService.deleteLanguage(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
}

module.exports = new LanguageController();
