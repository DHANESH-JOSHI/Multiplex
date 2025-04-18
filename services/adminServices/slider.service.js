const Slider = require('../../models/slider.model');

exports.createSlider = async (data) => {
    const newSlider = new Slider(data);
    return await newSlider.save();
};

exports.getAllSliders = async () => {
    return await Slider.find().sort({ order: 1 });
};

exports.getSliderById = async (id) => {
    return await Slider.findById(id);
};

exports.updateSlider = async (id, data) => {
    return await Slider.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteSlider = async (id) => {
    return await Slider.findByIdAndDelete(id);
};
