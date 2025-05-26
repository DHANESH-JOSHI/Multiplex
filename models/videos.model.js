const mongoose = require("mongoose");
const mongooseSequence = require("mongoose-sequence")(mongoose);


const videoSchema = new mongoose.Schema({
  videos_id: {
    type: Number,
    unique: true
  },

  channel_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "channel",
    required: true
  },

  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  imdbid: Number,

  title: {
    type: String,
    required: true
  },

  seo_title: String,

  slug: String,

  description: String,

  stars: {
    type: String,
    default: ""
  },

  director: [{
    type: Number,
    ref: "director"
  }], 
  writer: [{
    type: Number,
    ref: "writer"
  }], // Reference to Writer Model

  rating: {
    type: String,
    default: "0"
  },
  release: {
    type: String
  },

  genre: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Genre"
  }], // Reference to Genre Model


  language: [{
    type: String,

  }],

  country: [{
    type: String,
  }],

  video_type: String,

  runtime: String,

  video_quality: {
    type: String,
    default: "HD"
  },
  
  video_url: {
    type: String,
    default: "no Video"
  },

  videoContent_id: {
    type: String,
    required: true,
    default: 0
  },
  

  is_paid: {
    type: Number,
    required: true,
    default: 0
  },

  is_movie: {
    type: Boolean,
  },

  price: {
    type: Number,
    default: 0
  },

  publication: Number,

  lid: Number,

  trailer: {
    type: String,
  },

  trailler_youtube_source: String,

  enable_download: {
    type: String,
    Default: 1
  },

  download_link: {
    type: String,
  },

  focus_keyword: String,

  meta_description: String,

  tags: String,

  imdb_rating: String,

  image_url: {
    type: String
  },
  
  is_tvseries: {
    type: Number,
    required: true,
    default: 0
  },

  total_rating: {
    type: Number,
    default: 1
  },

  thumbnail_url: {
    type: String,
    default: "https://multiplexplay.com/img/logo1.png"
  },

  poster_url: {
    type: String,
    default: "https://multiplexplay.com/img/logo1.png"
  },

  today_view: {
    type: Number,
    default: 0
  },

  weekly_view: {
    type: Number,
    default: 0
  },

  monthly_view: {
    type: Number,
    default: 0
  },

  total_view: {
    type: Number,
    default: 1
  },

  last_ep_added: {
    type: Date,
    default: Date.now
  },

  cre: {
    type: Date,
    default: Date.now
  },
  
}, {
  collection: "videos"
});


videoSchema.plugin(mongooseSequence, {
  inc_field: "videos_id",
});

module.exports = mongoose.model("Video", videoSchema);