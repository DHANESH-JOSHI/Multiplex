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
  channel_id,
  release,
  price = 0,
  is_paid = 0,
  publication,
  trailer,
  thumbnail_url,
  poster_url,
  enable_download = false,
  pricing = [],
  use_global_price = true,
  video_url = null,
  videoContent_id = null,
  download_url = null
}) {
  const genreArray = Array.isArray(genre)
    ? genre
    : typeof genre === "string"
      ? JSON.parse(genre)
      : [genre];

  return CRUDService.create(Movie, {
    title,
    genre: genreArray,
    channel_id,
    release,
    is_paid,
    publication,
    trailer,
    thumbnail_url,
    poster_url,
    enable_download,
    video_url,          // ✅ received from controller
    videoContent_id,    // ✅ received from controller
    download_url,       // ✅ received if applicable
    pricing,
    price: Number(price) || 0,
    use_global_price,
    is_movie: true
  });
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

  async getMovieById(movieId, fieldName = "_id") {
    return CRUDService.getByIdArray(Movie, fieldName, movieId);
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
