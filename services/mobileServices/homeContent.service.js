const Slider = require('../../models/slider.model.js');
const Star = require('../../models/star.model.js');
const Country = require('../../models/country.model.js');
const Genre = require('../../models/genre.model.js');
const Video = require('../../models/videos.model.js');

const getHomeContent = async () => {
  // 1. Slider data
  // const sliderData = await Slider.find({ }).sort({ order: 1 }).lean();

  // const slider = {
  //   slider_type: "image",
  //   slide: sliderData.map(item => ({
  //     id: item.slider_id,
  //     title: item.title,
  //     description: item.description,
  //     image_link: item.image_link,
  //     slug: item.slug,
  //     action_type: item.action_type,
  //     action_btn_text: item.action_btn_text,
  //     action_id: item.action_id,
  //     action_url: item.action_url
  //   }))
  // };

  // 2. Popular stars
  const popularStars = await Star.find({  }).sort({ view: -1 }).limit(1).lean();
  const popular_stars = popularStars.map(star => ({
    star_id: star.star_id,
    star_name: star.star_name,
    image_url: star.image_url || "https://multiplexplay.com/office/uploads/star_image/default.jpg"
  }));

  // 3. All countries
  // const allCountries = await Country.find({ }).lean();
  // const all_country = allCountries.map(c => ({
  //   country_id: c.country_id,
  //   name: c.name,
  //   description: c.description,
  //   slug: c.slug,
  //   url: `https://multiplexplay.com/office/country/${c.slug}.html`,
  //   image_url: "https://multiplexplay.com/office/uploads/default_image/country.png"
  // }));

  // 4. All genres
  const allGenres = await Genre.find({ }).lean();
  const all_genre = allGenres.map(g => ({
    genre_id: g._id,
    name: g.name,
    description: g.description,
    slug: g.slug,
    url: `https://multiplexplay.com/office/genre/${g.slug}.html`,
    image_url: "https://multiplexplay.com/office/uploads/default_image/genre.png"
  }));

  // 5. Featured TV channels (if available)
  const featured_tv_channel = []; // For now, leave empty or implement as needed

  // 6. Latest movies (where is_tvseries is 0)
  const latestMovies = await Video.find({ }).sort({ cre: -1 }).limit(10).lean();
  const latest_movies = latestMovies.map(v => ({
    videos_id: v.videos_id,
    title: v.title,
    description: v.description,
    slug: v.slug,
    release: v.release ? v.release.toString() : "",
    is_paid: v.is_paid.toString(),
    runtime: v.runtime,
    video_quality: v.video_quality,
    thumbnail_url: v.thumbnail_url || "https://multiplexplay.com/office/uploads/default_image/thumbnail.jpg",
    poster_url: v.poster_url || "https://multiplexplay.com/office/uploads/default_image/poster.jpg"
  }));

  // 7. Latest TV series (where is_tvseries is 1)
  const latestTvseries = await Video.find({  }).sort({ cre: -1 }).limit(10).lean();
  const latest_tvseries = latestTvseries.map(v => ({
    videos_id: v.videos_id,
    title: v.title,
    description: v.description,
    slug: v.slug,
    is_paid: v.is_paid.toString(),
    release: v.release ? v.release.toString() : "",
    runtime: v.runtime,
    video_quality: v.video_quality,
    thumbnail_url: v.thumbnail_url || "https://multiplexplay.com/office/uploads/default_image/thumbnail.jpg",
    poster_url: v.poster_url || "https://multiplexplay.com/office/uploads/default_image/poster.jpg"
  }));

  // 8. Featured Genre and Movie – for each genre, fetch a list of videos matching that genre
  const features_genre_and_movie = await Promise.all(
  all_genre.map(async g => {

    const videos = await Video.find({ genre: { $in: [g.genre_id] } }) // Match genre array containing this genre
      .sort({ cre: -1 })
      .limit(10)
      .lean();

    return {
      genre_id: g._id,
      name: g.name,
      description: g.description,
      slug: g.slug,
      url: `https://multiplexplay.com/office/genre/${g.slug}.html`,
      videos: videos.map(v => ({
        videos_id: v.videos_id,
        title: v.title,
        release: v.release ? v.release.toString() : "",
        is_tvseries: v.is_tvseries ? v.is_tvseries.toString() : "0",
        is_paid: v.is_paid.toString(),
        video_quality: v.video_quality,
        thumbnail_url: v.thumbnail_url || "https://multiplexplay.com/office/uploads/default_image/thumbnail.jpg",
        poster_url: v.poster_url || "https://multiplexplay.com/office/uploads/default_image/poster.jpg"
      }))
    };
  })
);


  return {
    all_genre,
    featured_tv_channel,
    latest_movies,
    latest_tvseries,
    features_genre_and_movie
  };
};

const getContentById = async (id) => {
  const video = await Video.findOne({ videos_id: id }).lean();
  if (!video) {
    throw new Error('Content not found');
  }
  return {
    videos_id: video.videos_id,
    title: video.title,
    description: video.description,
    slug: video.slug,
    release: video.release ? video.release.toString() : "",
    is_tvseries: video.is_tvseries ? video.is_tvseries.toString() : "0",
    is_paid: video.is_paid.toString(),
    runtime: video.runtime,
    video_quality: video.video_quality,
    thumbnail_url: video.thumbnail_url || "https://multiplexplay.com/office/uploads/default_image/thumbnail.jpg",
    poster_url: video.poster_url || "https://multiplexplay.com/office/uploads/default_image/poster.jpg"
  };
};

const getAllContent = async () => {
  const videos = await Video.find().lean();
  return videos.map(video => ({
    videos_id: video.videos_id,
    title: video.title,
    description: video.description,
    slug: video.slug,
    release: video.release ? video.release.toString() : "",
    is_tvseries: video.is_tvseries ? video.is_tvseries.toString() : "0",
    is_paid: video.is_paid.toString(),
    runtime: video.runtime,
    video_quality: video.video_quality,
    thumbnail_url: video.thumbnail_url || "https://multiplexplay.com/office/uploads/default_image/thumbnail.jpg",
    poster_url: video.poster_url || "https://multiplexplay.com/office/uploads/default_image/poster.jpg"
  }));
};

module.exports = { getHomeContent, getContentById, getAllContent };