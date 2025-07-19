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

  // ① Upload to Cloudflare Stream using reusable function
  if (file) {
    const upload = await this.uploadVideoOnly(title, file, channel_id);

    if (!upload?.success) {
      throw new Error("❌ Failed to upload video to Cloudflare Stream");
    }
    console.log("ADD Movie", upload);
    const { uid, playback } = upload;
    videoContent_id = upload.videoContent_id;
    video_url = upload.video_url;
    
    // ② Optional: Generate download link
    if (enable_download) {
      const dl = await CloudCDNService.createDownload(videoContent_id);
      console.log(dl);
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

    console.log('uploadResult:', uploadResult);

    if (!uploadResult?.success) {
      throw new Error("Video upload to Cloudflare Stream failed.");
    }

    let { uid, playback } = uploadResult;

    let retryCount = 0;
    const maxRetries = 10;
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    while ((!uid || !playback?.hls) && retryCount < maxRetries) {
      console.warn(`Waiting for UID/playback... Retry ${retryCount + 1}`);
      await delay(1500); // wait for 1.5 seconds

      // Try to fetch video status again (you may need an API to check the upload status)
      const status = await CloudCDNService.getVideoStatus(uploadResult.temp_id || uid); // adjust key if needed
      if (status?.uid && status?.playback?.hls) {
        uid = status.uid;
        playback = status.playback;
        break;
      }

      retryCount++;
    }

    if (!uid || !playback?.hls) {
      throw new Error("UID or video playback URL not available after retries.");
    }

    return {
      success: true,
      videoContent_id: uid,
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
