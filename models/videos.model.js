const mongoose = require("mongoose");
const mongooseSequence = require("mongoose-sequence")(mongoose);


const videoSchema = new mongoose.Schema({
  videos_id: {
    type: Number,
    required: true,
    unique: true
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
  country: [{
    type: Number,
    ref: "Country"
  }], // Reference to Country Model
  genre: [{
    type: Number,
    ref: "Genre"
  }], // Reference to Genre Model
  language: [{
    type: Number,
    ref: "LanguagesIso"
  }],

  video_type: String,

  runtime: String,

  video_quality: {
    type: String,
    default: "HD"
  },

  is_paid: {
    type: Number,
    required: true,
    default: 0
  },

  publication: Number,

  lid: Number,

  trailer: {
    type: Number,
    default: 0
  },
  
  trailler_youtube_source: String,

  enable_download: {
    type: Number,
    default: 1
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