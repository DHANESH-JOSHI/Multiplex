const Slider = require('../../models/slider.model.js');
const Star = require('../../models/star.model.js');
const Country = require('../../models/country.model.js');
const Genre = require('../../models/genre.model.js');
const Video = require('../../models/videos.model.js');
const webseriesModel = require('../../models/webseries.model.js');
const episodesModel = require('../../models/episodes.model.js');
const channelModel = require('../../models/channel.model.js');
const subscriptionModel = require('../../models/subscription.model.js');
const CountryFilteringService = require('../countryFiltering.service');

const getHomeContent = async (country, channel_id, user_id) => {
  

  const fallbackThumb = "https://multiplexplay.com/office/uploads/default_image/thumbnail.jpg";
  const fallbackPoster = "https://multiplexplay.com/office/uploads/default_image/poster.jpg";

  // Check user subscription for access control
  let userHasAdminSubscription = false;
  if (user_id && channel_id) {
    const now = Date.now();
    const adminSubscription = await subscriptionModel.findOne({
      user_id,
      channel_id,
      status: 1,
      is_active: 1,
      timestamp_to: { $gt: now },
      plan_id: { $exists: true, $ne: null }
    }).populate({
      path: 'plan_id',
      match: { 
        $or: [
          { is_movie: false },        // Admin plan
          { is_movie: { $exists: false } }  // Old plan without field
        ]
      },
      select: 'name price is_movie type'
    }).lean();

    userHasAdminSubscription = !!(adminSubscription && adminSubscription.plan_id);
    console.log("HomeContent subscription check:", {
      user_id,
      channel_id,
      hasAdminSub: userHasAdminSubscription
    });
  }

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
  const popularStars = await Star.find({  }).sort({ view: -1 }).lean();
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
  const featured_tv_channel = await channelModel.find({ }).sort({ cre: -1 }).lean() || [] ; // For now, leave empty or implement as needed
  // const movies = 
//country: { $in: country }
  // 6. Latest movies (filter by channel_id if provided)
  const movieFilter = channel_id ? { channel_id } : {};
  const latestMovies = await Video.find(movieFilter).sort({ cre: -1 }).lean();
  
  const webseriesFilter = channel_id ? { channel_id } : {};
  const latestWebseries = await webseriesModel.find(webseriesFilter).sort({ cre: -1 }).lean();

  let allVideos = [...latestMovies, ...latestWebseries];
  
  // Apply country filtering to all videos
  if (country && allVideos.length > 0) {
    const filteredResult = await CountryFilteringService.applyCountryFilter(country, allVideos);
    allVideos = filteredResult.content;
  }
  
  const latest_movies = allVideos.map((v, index) => {
    if (!v._id || !v.title) {
      console.warn(`Content at index ${index} is missing ID or title`, v);
    }

    // Determine subscription status for this content
    let isSubscribed = false;
    if (userHasAdminSubscription) {
      // Admin subscription gives access to all content
      isSubscribed = true;
    } else if (user_id && channel_id) {
      // Check for individual content subscription
      // This would need to be checked against subscription table
      // For now, defaulting to false unless admin subscription
      isSubscribed = false;
    }
    
    return {
      videos_id: v._id,
      numeric_videos_id: v.videos_id ?? "",
      channel_id: v.channel_id,
      title: v.title,
      description: v.description ?? "",
      slug: v.slug ?? "",
      release: v.release ? v.release.toString() : "",
      is_paid: (v.is_paid ?? 0).toString(),
      price: v.country_price || v.price || 0, // Use country-specific price from filtering service
      pricing: v.pricing ?? [ { "country": "null", "price": 0 },],
      use_global_price: v.use_global_price ?? true,
      runtime: v.runtime ?? 0,
      video_quality: v.video_quality ?? "HD",
      video_url: isSubscribed ? v.video_url ?? "" : "", // Hide video_url if not subscribed
      trailer: v.trailer ?? "",
      download_link: isSubscribed ? v.download_link ?? "" : "", // Hide download if not subscribed
      enable_download: v.enable_download ?? "0",
      is_tvseries: v.is_tvseries ?? 1,
      videoContent_id: v.videoContent_id ?? "",
      stars: v.stars ?? "",
      director: v.director ?? [],
      writer: v.writer ?? [],
      rating: v.rating ?? "0",
      country: v.country ?? [],
      genre: v.genre ?? [],
      language: v.language ?? [],
      total_rating: v.total_rating ?? 0,
      today_view: v.today_view ?? 0,
      weekly_view: v.weekly_view ?? 0,
      monthly_view: v.monthly_view ?? 0,
      total_view: v.total_view ?? 0,
      last_ep_added: v.last_ep_added ?? "",
      created_at: v.cre ?? "",
      thumbnail_url: v.thumbnail_url || fallbackThumb,
      poster_url: v.poster_url || fallbackPoster,
      isSubscribed: isSubscribed, // Add subscription status
      __v: v.__v ?? 0,
    };
});


// 7. Latest TV series (filter by channel_id if provided)
  const tvseriesFilter = channel_id ? { channel_id } : {};
  const latestTvseries = await Video.find(tvseriesFilter).sort({ cre: -1 }).lean();
  const latest_tvseries = latestTvseries.map(v => ({
    videos_id: v.videos_id,
    title: v.title,
    description: v.description,
    slug: v.slug,
    is_paid: v.is_paid?.toString() || "1",
    release: v.release ? v.release.toString() : "",
    runtime: v.runtime,
    video_quality: v.video_quality,
    thumbnail_url: v.thumbnail_url || "https://multiplexplay.com/office/uploads/default_image/thumbnail.jpg",
    poster_url: v.poster_url || "https://multiplexplay.com/office/uploads/default_image/poster.jpg"
  }));

  // 8. Featured Genre and Movie – for each genre, fetch a list of videos matching that genre
 const features_genre_and_movie = await Promise.all(
 all_genre.map(async g => {
 // Add channel_id filter for videos
 const videoFilter = {
 genre: { $in: [g.genre_id] },
 is_movie: { $eq: false, $exists: true },  // `is_movie` must exist and be false
 ...(channel_id && { channel_id })  // Add channel filter if provided
 };
    const videos = await Video.find(videoFilter)
      .sort({ cre: -1 })
      .lean();

 // Add channel_id filter for webseries
 const webseriesFilterGenre = {
      genre: { $in: [g.genre_id] },
      ...(channel_id && { channel_id })  // Add channel filter if provided
    };
    const webseriess = await webseriesModel.find(webseriesFilterGenre)
      .sort({ cre: -1 })
      .lean();

    // Merge both arrays
    let mergedVideos = [
      ...(videos || []).map(v => ({
        videos_id: v._id.toString(),
        title: v.title,
        channel_id: v.channel_id,
        release: v.release ? v.release.toString() : "",
        is_tvseries: v.is_tvseries ? v.is_tvseries.toString() : "0",
        is_paid: v.is_paid?.toString() || "1",
        video_quality: v.video_quality,
        thumbnail_url: v.thumbnail_url || "https://multiplexplay.com/office/uploads/default_image/thumbnail.jpg",
        poster_url: v.poster_url || "https://multiplexplay.com/office/uploads/default_image/poster.jpg",
        // Include filtering fields
        use_global_price: v.use_global_price,
        pricing: v.pricing,
        country: v.country,
        price: v.price
      })),
      ...(webseriess || []).map(w => ({
        videos_id: w._id.toString(), // Use _id as videos_id if needed
        title: w.title,
        channel_id: w.channel_id,
        release: w.release ? w.release.toString() : "",
        is_tvseries: "1", // Assuming all webseries are TV series
        is_paid: w.is_paid?.toString() || "1",
        video_quality: w.video_quality || "HD", // Default/fallback
        thumbnail_url: w.thumbnail_url || "https://multiplexplay.com/office/uploads/default_image/thumbnail.jpg",
        poster_url: w.poster_url || "https://multiplexplay.com/office/uploads/default_image/poster.jpg",
        // Include filtering fields
        use_global_price: w.use_global_price,
        pricing: w.pricing,
        country: w.country,
        price: w.price
      }))
    ];

    // Apply country filtering to genre videos
    if (country && mergedVideos.length > 0) {
      const filteredResult = await CountryFilteringService.applyCountryFilter(country, mergedVideos);
      mergedVideos = filteredResult.content;
    }

    // ✅ Skip if merged list is empty
    if (mergedVideos.length === 0) return null;

    return {
      genre_id: g.genre_id,
      name: g.name,
      description: g.description,
      slug: g.slug,
      url: `https://multiplexplay.com/office/genre/${g.slug}.html`,
      videos: mergedVideos
    };
  })
);


const filtered_features = features_genre_and_movie.filter(Boolean);



  return {
    all_genre,
    featured_tv_channel,
    latest_movies,
    latest_tvseries,
    features_genre_and_movie: filtered_features
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