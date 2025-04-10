const Slider = require("../../models/slider.model");

// Create new banner (slider)
exports.addSlider = async (req, res) => {
    try {
        const {
            slider_id,
            title,
            description,
            video_link,
            image_link,
            slug,
            action_type,
            action_btn_text,
            action_id,
            action_url,
            order,
            publication
        } = req.body;

        if (!slider_id || !title || !video_link || !image_link || !slug || publication === undefined) {
            return res.status(400).json({ message: "Required fields are missing" });
        }

        const existing = await Slider.findOne({ slider_id });
        if (existing) {
            return res.status(409).json({ message: "Slider with this ID already exists" });
        }

        const newSlider = new Slider({
            slider_id,
            title,
            description,
            video_link,
            image_link,
            slug,
            action_type,
            action_btn_text,
            action_id,
            action_url,
            order,
            publication
        });

        await newSlider.save();
        res.status(201).json({ message: "Slider created successfully", data: newSlider });
    } catch (error) {
        res.status(500).json({ message: "Error creating slider", error: error.message });
    }
};

// Get all sliders
exports.getAllSliders = async (req, res) => {
    try {
        const sliders = await Slider.find();
        res.status(200).json({ message: "Sliders fetched successfully", data: sliders });
    } catch (error) {
        res.status(500).json({ message: "Error fetching sliders", error: error.message });
    }
};

// Get a single slider by ID
exports.getSliderById = async (req, res) => {
    try {
        const slider = await Slider.findById(req.params.id);
        if (!slider) {
            return res.status(404).json({ message: "Slider not found" });
        }
        res.status(200).json({ message: "Slider retrieved", data: slider });
    } catch (error) {
        res.status(500).json({ message: "Error fetching slider", error: error.message });
    }
};

// Update slider by ID
exports.updateSlider = async (req, res) => {
    try {
        const updatedSlider = await Slider.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSlider) {
            return res.status(404).json({ message: "Slider not found" });
        }
        res.status(200).json({ message: "Slider updated", data: updatedSlider });
    } catch (error) {
        res.status(500).json({ message: "Error updating slider", error: error.message });
    }
};

// Delete slider by ID
exports.deleteSlider = async (req, res) => {
    try {
        const deletedSlider = await Slider.findByIdAndDelete(req.params.id);
        if (!deletedSlider) {
            return res.status(404).json({ message: "Slider not found" });
        }
        res.status(200).json({ message: "Slider deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting slider", error: error.message });
    }
};
