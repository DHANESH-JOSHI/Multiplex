const mongoose = require("mongoose");

const wishListSchema = new mongoose.Schema({
  wish_list_type: { type: String, required: true },
  // Relate to User model
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Relate to Video model
  video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },

  // Relate to Episode model
  episode:{ type: mongoose.Schema.Types.ObjectId, ref: "Episode"},
  
  // Relate to Season model
  season: { type: mongoose.Schema.Types.ObjectId, ref: "Season" },

  // Relate to Channel model
  channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },

  //GENRE
  genre: { type: mongoose.Schema.Types.ObjectId, ref: "Genre" },

  //country
  country: { type: mongoose.Schema.Types.ObjectId, ref: "country" },


  created_at: { type: Date, default: Date.now },
  status: { type: Number, default: 1 }
}, { collection: "wish_list" });

module.exports = mongoose.model("WishList", wishListSchema);
