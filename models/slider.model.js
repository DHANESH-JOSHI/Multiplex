const mongoose = require("mongoose");
const { Types } = mongoose;
const Video = require("./videos.model");

const sliderSchema = new mongoose.Schema(
  {
    slider_id: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "NA" },
    videos_id: { type: String, required: true }, // store as string
    channel_id: { type: String, default: "" }, // auto-fill hoga
    image_link: { type: String, required: true },
    slug: { type: String, required: true },
    action_type: { type: String, default: "NA", enum: ["tvseries", "movie"] },
    action_btn_text: String,
    action_id: Number,
    action_url: String,
    order: { type: Number, default: 0 },
    publication: { type: Number, required: true },
  },
  {
    collection: "slider",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// pre-save hook
sliderSchema.pre("save", async function (next) {
  if (this.isModified("videos_id") || this.isNew) {
    try {
      const video = await Video.findById(new Types.ObjectId(this.videos_id));
      if (video) {
        this.channel_id = video.channel_id;
      }
    } catch (err) {
      console.error("Error fetching video for slider:", err);
    }
  }
  next();
});

module.exports = mongoose.model("Slider", sliderSchema);
