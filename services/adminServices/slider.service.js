const Slider = require("../../models/slider.model");

exports.createSlider = async (data) => {
  const newSlider = new Slider(data);
  return await newSlider.save();
};

exports.getAllSliders = async () => {
  return await Slider.aggregate([
    {
      $lookup: {
        from: "videos",
        let: { videoId: { $toObjectId: "$videos_id" } }, // convert string -> ObjectId
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$videoId"] } } },
          { $project: { channel_id: 1 } },
        ],
        as: "videoData",
      },
    },
    {
      $addFields: {
        channel_id: {
          $ifNull: [{ $arrayElemAt: ["$videoData.channel_id", 0] }, ""],
        },
      },
    },
    { $project: { videoData: 0 } }, // extra array hata diya
    { $sort: { order: 1 } },
  ]);
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
