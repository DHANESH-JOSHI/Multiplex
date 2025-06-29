const Movie = require("../../models/videos.model");
const CloudCDNService = require("../../config/cloudFlareCDN");
const CRUDService = require("../../services/crud.service");

class MovieService {
  /* ──────────────────────────────────────────
   * 1️⃣  CREATE  (file upload + DB insert)
   * ──────────────────────────────────────────*/
  async addMovie({
  title,
  genre,
  file,
  channel_id,
  release,
  price = "0",
  is_paid = 0,
  publication,
  trailer,
  thumbnail_url,
  poster_url,
  enable_download = false,
  pricing = [],
  use_global_price = true
}) {
  let video_url = null;
  let download_link = null;
  let videoContent_id = null;

  const genreArray = Array.isArray(genre) ? genre : [genre];

  // ① Upload to Cloudflare Stream
  if (file) {
    const uploadResult = await CloudCDNService.uploadVideo(title, file, {
      creator: channel_id,
      meta: { title }
    });

    if (!uploadResult?.success) {
      throw new Error("❌ Failed to upload video to Cloudflare Stream");
    }

    const { uid, playback } = uploadResult;
    videoContent_id = uid;
    video_url = playback?.hls || null;

    // ② Optional: Generate download link
    if (enable_download) {
      const dl = await CloudCDNService.createDownload(uid);
      if (dl?.success) download_link = dl.downloadUrl;
      else console.warn("⚠️ Download link generation failed:", dl?.error);
    }
  }

  // ③ Save to DB
  const result = await CRUDService.create(Movie, {
    videoContent_id,
    channel_id,
    title,
    genre: genreArray,
    video_url,
    download_link,
    release,
    price: Number(price) || 0,
    pricing,
    use_global_price,
    is_paid,
    is_movie: true,
    publication,
    trailer,
    thumbnail_url,
    poster_url,
    enable_download
  });

  return result;
}



  /* ──────────────────────────────────────────
   * 2️⃣  PURE UPLOAD  (re-used by controller helper)
   * ──────────────────────────────────────────*/
  async uploadVideoOnly(title, file, creatorId) {
    if (!file) throw new Error("No video file provided.");

    const uploadResult = await CloudCDNService.uploadVideo(title, file, {
      creator: creatorId,
      meta: { title }
    });
    console.log('uploadResult:', uploadResult)

    if (!uploadResult?.success) {
      throw new Error("Video upload to Cloudflare Stream failed.");
    }

    const { uid, playback } = uploadResult;
    return {
      success: true,
      videoContent_id: parseInt(uid),
      video_url: playback.hls
    };
  }

  /* ──────────────────────────────────────────
   * 3️⃣  READ OPERATIONS
   * ──────────────────────────────────────────*/
  async getAllMovies(queryParams) {
    return CRUDService.getAllPages(Movie, {}, queryParams);
  }

  async getAllMoviesByCountry(queryParams) {
    return CRUDService.getAllPages(Movie, {}, queryParams);
  }

  async getMovieById(movieId, fieldName = "_id", populate = [], country = "IN") {
    const movieResult = await CRUDService.getByIdArray(Movie, fieldName, movieId, populate);

    if (movieResult?.data?.length) {
      const movie = movieResult.data[0];

      if (!movie.use_global_price) {
        const matchedPricing = movie.pricing?.find(p => p.country.toUpperCase() === country.toUpperCase());

        if (matchedPricing) {
          movie.price = matchedPricing.price; // Override with dynamic price
        } else {
          movie.price = 0; // or fallback global/def  ault price if no country match
        }
      }

      movieResult.data[0] = movie;
    }

    return movieResult;
  }



  /* ──────────────────────────────────────────
   * 4️⃣  UPDATE  (uses _id by default)
   * ──────────────────────────────────────────*/
  async updateMovie(movieId, movieData, fieldName = "_id") {
    return CRUDService.update(Movie, fieldName, movieId, movieData);
  }

  /* ──────────────────────────────────────────
   * 5️⃣  DELETE  (also deletes from CDN)
   * ──────────────────────────────────────────*/
  async deleteMovie(movieId) {
    // Delete DB record first
    const deleted = await CRUDService.delete(Movie, movieId);
    // If the video existed on CDN, remove it there too
    if (deleted?.data?.videoContent_id) {
      await CloudCDNService.deleteVideo(deleted.data.videoContent_id);
    }
    return deleted;
  }
}

module.exports = new MovieService();
