const sliderService = require("../../services/adminServices/slider.service");

exports.createSlider = async (req, res) => {
  try {
    let data = { ...req.body };

    if (req.file) {
      // Assuming you're hosting files from /uploads (e.g., http://yourdomain.com/uploads/filename)
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
      data.image_link = fileUrl;
    }

    const slider = await sliderService.createSlider(data);
    res.status(201).json({ success: true, data: slider });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllSliders = async (req, res) => {
  try {
    const sliders = await sliderService.getAllSliders();
    console.log(sliders);
    res.status(200).json({ success: true, data: sliders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSliderById = async (req, res) => {
  try {
    const slider = await sliderService.getSliderById(req.params.id);
    if (!slider)
      return res
        .status(404)
        .json({ success: false, message: "Slider not found" });
    res.status(200).json({ success: true, data: slider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSlider = async (req, res) => {
  try {
    let data = { ...req.body };

    // If file is uploaded, convert it to URL and update `image_link`
    if (req.file) {
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
      data.image_link = fileUrl;
    }

    const updated = await sliderService.updateSlider(req.params.id, data);

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Slider not found" });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSlider = async (req, res) => {
  try {
    const deleted = await sliderService.deleteSlider(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Slider not found" });
    res
      .status(200)
      .json({ success: true, message: "Slider deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
