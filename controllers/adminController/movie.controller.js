const MovieService = require("../../services/adminServices/movie.service");

class MovieController {

  /** ─────────────────────────────────────────────
   *  Private helper – handles every file upload
   *  Always calls MovieService.uploadVideoOnly()
   *  Returns { videoPath, uploadMeta }
   *  ────────────────────────────────────────────*/
  async #handleUpload(req, title, creatorId = null) {
    const file = req.file?.path || null;
    if (!file) return { videoPath: null, uploadMeta: null };

    // reuse the centralized upload service
    const uploadResult = await MovieService.uploadVideoOnly(title, file, creatorId);
    // Adjust the key names here to whatever your service returns
    return { 
      videoPath: uploadResult?.storedPath || uploadResult?.url || null,
      uploadMeta: uploadResult
    };
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
        use_global_price
      } = req.body;

      /* ① upload file (if any) through the single helper */
      const { videoPath } = await this.#handleUpload(req, title, channel_id);

      /* ② parse pricing safely */
      const parsedPricing = Array.isArray(pricing)
        ? pricing
        : typeof pricing === "string"
          ? JSON.parse(pricing)
          : [];

      /* ③ create movie */
      const movie = await MovieService.addMovie({
        title,
        genre,
        channel_id,
        release,
        is_paid,
        publication,
        trailer,
        thumbnail_url,
        poster_url,
        enable_download,
        video_url: videoPath,      // <── centralised upload path
        pricing: parsedPricing,
        price: Number(price) || 0, // global price
        use_global_price: use_global_price !== "false"
      });

      res.status(200).json({ success: true, movie });
    } catch (error) {
      res.status(400).json({ message: error.message });
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
