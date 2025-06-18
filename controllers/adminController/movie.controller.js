const CloudflareStreamService = require("../../config/cloudFlareCDN");
const MovieService = require("../../services/adminServices/movie.service");

class MovieController {

  /** ─────────────────────────────────────────────
   *  Private helper – handles every file upload
   *  Always calls MovieService.uploadVideoOnly()
   *  Returns { videoPath, uploadMeta }
   *  ────────────────────────────────────────────*/
  async #handleUpload(req, title, creatorId = null) {
   
  }

  /** ─────────────────────────────────────────────
   *  Add a new movie
   *  ────────────────────────────────────────────*/
async addMovie(req, res) {
  try {
    const {
      title,
      genre,
      channel_id,
      release,
      price,
      is_paid,
      publication,
      trailer,
      thumbnail_url,
      poster_url,
      enable_download,
      pricing,
      use_global_price,
    } = req.body;

    const parsedGenre = Array.isArray(genre)
      ? genre
      : typeof genre === "string"
        ? JSON.parse(genre)
        : [];

    const parsedPricing = Array.isArray(pricing)
      ? pricing
      : typeof pricing === "string"
        ? JSON.parse(pricing)
        : [];

    let video_url = null;
    let videoContent_id = null;
    let download_url = null;

    if (req.file?.path) {
      const uploadResult = await CloudflareStreamService.uploadVideo(title, req.file.path, {
        creator: channel_id,
        meta: { title }
      });

      if (!uploadResult?.success) {
        throw new Error("Failed to upload video to Cloudflare Stream");
      }

      const { uid, playback } = uploadResult;
      videoContent_id = uid;
      video_url = playback?.hls || null;

      if (enable_download === "true" || enable_download === true) {
        const dl = await CloudflareStreamService.createDownload(uid);
        if (dl?.success) {
          download_url = dl.downloadUrl;
        } else {
          console.warn("Download link generation failed:", dl?.error);
        }
      }
    }

    const movie = await MovieService.addMovie({
      title,
      genre: parsedGenre,
      channel_id,
      release,
      is_paid,
      publication,
      trailer,
      thumbnail_url,
      poster_url,
      enable_download,
      pricing: parsedPricing,
      price: Number(price) || 0,
      use_global_price: use_global_price !== "false",
      video_url,
      videoContent_id,
      download_url
    });

    res.status(200).json({ success: true, movie });

  } catch (error) {
    console.error("Error in addMovie:", error);
    res.status(400).json({ message: `Error creating record: ${error.message}` });
  }
}







  /** ─────────────────────────────────────────────
   *  Upload-only endpoint (unchanged, still public)
   *  ────────────────────────────────────────────*/
  async uploadOnly(req, res) {
    try {
      const { title, creatorId } = req.body;
      const file = req.file?.path || null;
      const result = await MovieService.uploadVideoOnly(title, file, creatorId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /** ─────────────────────────────────────────────
   *  Get all movies
   *  ────────────────────────────────────────────*/
  async getAllMovies(req, res) {
    try {
    let result;
    let isSubscribed = false; // Default
    const { vId, user_id, channel_id } = req.query;

    if (vId) {
      const movieId = vId;
      const fieldAliases = { video_id: "videos_id", vid: "videos_id" };
      const rawField = req.query.fieldKey;
      const fieldName = fieldAliases[rawField] || rawField || "_id";

      // Step 1: Fetch Movie
      result = await MovieService.getMovieById(movieId, fieldName);

      // Step 2: Check Subscription
      if (user_id && channel_id) {
        const now = Date.now();
        const activeSubscription = await SubscriptionSchema.findOne({
          user_id,
          video_id: movieId,
          channel_id,
          status: 1,
          timestamp_to: { $gt: now }
        });

        if (activeSubscription) {
          isSubscribed = true;
        }
      }
    } else {
      // If no vId, fetch all movies
      result = await MovieService.getAllMovies(req.query);
    }

    // Step 3: Format Final Response
    const finalResponse = {
      message: result.message,
      isSubscribed,
      data: result.data
    };

    res.status(200).json(finalResponse);
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      message: error.message,
      isSubscribed: false,
      data: []
    });
  }
}


  /** ─────────────────────────────────────────────
   *  Get movie by ID (with alias support)
   *  ────────────────────────────────────────────*/
  async getMovieById(req, res) {
    try {
      const movieId = req.query.vId;
      const fieldAliases = { video_id: "videos_id", vid: "videos_id" };
      const rawField = req.query.fieldKey;
      const fieldName = fieldAliases[rawField] || rawField || "_id";

      const result = await MovieService.getMovieById(movieId, fieldName);
      res.status(200).json(result);
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({ message: error.message });
    }
  }

  /** ─────────────────────────────────────────────
   *  Update movie (file upload handled the same way)
   *  ────────────────────────────────────────────*/
  async updateMovie(req, res) {
    try {
      /* ① upload new file if sent */
      const { videoPath } = await this.#handleUpload(req, req.body.title ?? "update");

      /* ② parse pricing safely */
      const {
        pricing,
        price,
        use_global_price,
        ...rest
      } = req.body;

      const parsedPricing = Array.isArray(pricing)
        ? pricing
        : typeof pricing === "string"
          ? JSON.parse(pricing)
          : [];

      const updatePayload = {
        ...rest,
        ...(videoPath ? { video_url: videoPath } : {}), // only set if new upload
        pricing: parsedPricing,
        price: Number(price) || 0,
        use_global_price: use_global_price !== "false"
      };

      const result = await MovieService.updateMovie(req.params.id, updatePayload);

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /** ─────────────────────────────────────────────
   *  Delete movie
   *  ────────────────────────────────────────────*/
  async deleteMovie(req, res) {
    try {
      const result = await MovieService.deleteMovie(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new MovieController();
