const Episode = require("../../models/episodes.model");

// Create a new web series episode with error handling
exports.addWebseries = async (req, res) => {
    try {
        let data = req.body;
        await video_file.create({ data });
        //bunny folder API for webseries
        res.send(response);
    } catch (error) {
        res.status(500).json({ message: "Error adding web series episode", error: error.message });
    }
};

// Get all web series episodes
exports.getAllWebseries = async (req, res) => {
    try {
        const episodes = await Episode.find().populate("video season");
        res.status(200).json({ message: "Web series episodes retrieved successfully", data: episodes });
    } catch (error) {
        res.status(500).json({ message: "Error fetching web series episodes", error: error.message });
    }
};

// Get a single episode by ID
exports.getWebseriesById = async (req, res) => {
    try {
        const episode = await Episode.findById(req.params.id).populate("video season");
        if (!episode) {
            return res.status(404).json({ message: "Episode not found" });
        }
        res.status(200).json({ message: "Episode retrieved successfully", data: episode });
    } catch (error) {
        res.status(500).json({ message: "Error fetching episode", error: error.message });
    }
};

// Update an episode by ID
exports.updateWebseries = async (req, res) => {
    try {
        const updatedEpisode = await Episode.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEpisode) {
            return res.status(404).json({ message: "Episode not found" });
        }
        res.status(200).json({ message: "Episode updated successfully", data: updatedEpisode });
    } catch (error) {
        res.status(500).json({ message: "Error updating episode", error: error.message });
    }
};

// Delete an episode by ID
exports.deleteWebseries = async (req, res) => {
    try {
        const deletedEpisode = await Episode.findByIdAndDelete(req.params.id);
        if (!deletedEpisode) {
            return res.status(404).json({ message: "Episode not found" });
        }
        res.status(200).json({ message: "Episode deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting episode", error: error.message });
    }
};