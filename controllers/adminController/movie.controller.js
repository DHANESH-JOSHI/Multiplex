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
      is_movie,
      publication,
      trailer,
      thumbnail_url,
      poster_url,
      enable_download,
      pricing,
      use_global_price
    } = req.body;

    // 🧠 Parse genre safely
    const parsedGenre = Array.isArray(genre)
      ? genre
      : typeof genre === "string"
        ? JSON.parse(genre)
        : [];

    // 💰 Parse pricing safely
    const parsedPricing = Array.isArray(pricing)
      ? pricing
      : typeof pricing === "string"
        ? JSON.parse(pricing)
        : [];

    // 🧾 Call Service
    const movie = await MovieService.addMovie({
      title,
      genre: parsedGenre,
      file: req.file?.path,
      channel_id,
      release,
      price,
      is_paid,
      is_movie,
      publication,
      trailer,
      thumbnail_url,
      poster_url,
      enable_download,
      pricing: parsedPricing,
      use_global_price
    });
    function cleanMongoDoc(doc) {
      const json = JSON.parse(JSON.stringify(doc));
      const walk = (obj) => {
        for (const key in obj) {
          if (typeof obj[key] === "object" && obj[key] !== null) {
            if (obj[key].$oid) obj[key] = obj[key].$oid;
            if (obj[key].$date) obj[key] = obj[key].$date;
            else walk(obj[key]);
          }
        }
      };
      walk(json);
      return json;
    }

    // ✅ Return clean response
    res.status(200).json({ success: true, movie: cleanMongoDoc(movie)  });

  } catch (error) {
    console.error("❌ Error in addMovie:", error);
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
      const country  = req.query.country; //|| req.headers['x-country'] ||
      const fieldAliases = { video_id: "videos_id", vid: "videos_id" };
      const rawField = req.query.fieldKey;
      const fieldName = fieldAliases[rawField] || rawField || "_id";
      const populate = req.query.populate?.split(",") || [];

      result = await MovieService.getMovieById(movieId, fieldName, populate, country);

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
      const country  = req.query.country; //|| req.headers['x-country'] ||
      console.log(country);
      const fieldAliases = { video_id: "videos_id", vid: "videos_id" };
      const rawField = req.query.fieldKey;
      const fieldName = fieldAliases[rawField] || rawField || "_id";
      const populate = req.query.populate?.split(",") || [];

      const result = await MovieService.getMovieById(movieId, fieldName, populate, country);

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
