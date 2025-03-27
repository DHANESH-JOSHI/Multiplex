const mongoose = require("mongoose");

const directorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { collection: "directors" }
);

module.exports = mongoose.model("Director", directorSchema);
