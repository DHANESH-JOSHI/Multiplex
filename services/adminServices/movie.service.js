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
    price = "0",          // global price (fallback)
    is_paid = 0,
    publication,
    trailer,
    thumbnail_url,
    poster_url,
    enable_download = false,
    pricing = [],       // [{ country, price }, ...]
    use_global_price = true
  }) {
    let video_url = null;
    let download_url = null;
    let videoContent_id = null;

    const genreArray = Array.isArray(genre) ? genre : [genre];

    /* ① Upload to Cloudflare Stream (if file given) */
    if (file) {
      const uploadResult = await CloudCDNService.uploadVideo(title, file, {
        creator: channel_id,          // store who uploaded
        meta: { title }
      });

      if (!uploadResult?.success) {
        throw new Error("Failed to upload video to Cloudflare Stream");
      }

      const { uid, playback } = uploadResult;
      videoContent_id = parseInt(uid);
      video_url = playback.hls;

      /* ② Generate download link (optional) */
      if (enable_download) {
        const dl = await CloudCDNService.createDownload(uid);
        if (dl?.success) download_url = dl.downloadUrl;
        else console.warn("Download link generation failed:", dl?.error);
      }
    }

    /* ③ Insert record in MongoDB */
    return CRUDService.create(Movie, {
      videoContent_id,       // may be null if no file yet
      channel_id,
      title,
      genre: genreArray,
      video_url,
      download_url,
      release,
      price: Number(price) || 0,
      pricing,               // country-wise array
      use_global_price,
      is_paid,
      is_movie: true,
      publication,
      trailer,
      thumbnail_url,
      poster_url,
      enable_download
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
    return CRUDService.getById(Movie, fieldName, movieId);
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
