const mongoose = require("mongoose");

const writerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { collection: "writers" }
);

module.exports = mongoose.model("Writer", writerSchema);
