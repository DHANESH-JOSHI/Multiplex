const CloudflareStreamService = require("../../config/cloudFlareCDN");
const subscriptionModel = require("../../models/subscription.model");
const videosModel = require("../../models/videos.model");
const channelSubscribeModel = require("../../models/subcribe.model");
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
    let userSubscribed = false;
    console.log(req.query);
    const { vId, user_id, channel_id } = req.query;

    if (vId) {
      const movieId = vId;
      const country  = req.query.country; //|| req.headers['x-country'] ||
      const fieldAliases = { video_id: "videos_id", vid: "videos_id" };
      const rawField = req.query.fieldKey;
      const fieldName = fieldAliases[rawField] || rawField || "_id";
      const populate = req.query.populate?.split(",") || [];

      result = await MovieService.getMovieById(movieId, fieldName, populate, country);
      if (result?.data?.[0]) {
        const isMovie = result.data[0].is_movie;
        const relatedVideos = await videosModel.find({ is_movie: isMovie }).lean();
        const userSubscribe = await channelSubscribeModel.find({
          user: user_id,
          channel: channel_id,
        });
        if (userSubscribe.length > 0) {
           userSubscribed = true;
        }
        // console.log("data",userSubscribe);
        // result = result.data
        // result.data.userSubscribed = userSubscribe.length > 0;

        result.related_movie = relatedVideos;
      }

      
      

      // Step 2: Check Subscription
      if (user_id && channel_id) {
        const now = Date.now();
        
        // 🎯 Simple Logic: Check if user has admin plan (is_movie: false or doesn't exist)
        const userSubscription = await subscriptionModel.findOne({
          user_id,
          channel_id,
          status: 1,
          is_active: 1,
          timestamp_to: { $gt: now },
          plan_id: { $exists: true, $ne: null }
        }).populate({
          path: 'plan_id',
          select: 'name price is_movie type'
        });

        console.log("🔍 User subscription check:", {
          subscriptionFound: !!userSubscription,
          planExists: !!userSubscription?.plan_id,
          planIsMovie: userSubscription?.plan_id?.is_movie,
          planName: userSubscription?.plan_id?.name
        });

        // Admin plan: is_movie = false OR is_movie field doesn't exist
        let hasAdminAccess = false;
        if (userSubscription && userSubscription.plan_id) {
          const plan = userSubscription.plan_id;
          // Admin plan condition: is_movie is false OR field doesn't exist
          hasAdminAccess = (plan.is_movie === false || plan.is_movie === undefined);
          console.log("✅ Admin access:", hasAdminAccess, "| Plan is_movie:", plan.is_movie);
        }

        console.log("🎯 Final result - hasAdminAccess:", hasAdminAccess);

        if (hasAdminAccess) {
          isSubscribed = true;
        } else {
          // Check individual movie subscription
          const individualSubscription = await subscriptionModel.findOne({
            user_id,
            video_id: movieId,
            channel_id,
            status: 1,
            is_active: 1,
            timestamp_to: { $gt: now }
          }).populate({
            path: 'plan_id',
            match: { is_movie: true },
            select: 'name price is_movie type'
          });

          // Check no plan subscription
          const noPlanSubscription = await subscriptionModel.findOne({
            user_id,
            video_id: movieId,
            channel_id,
            status: 1,
            is_active: 1,
            timestamp_to: { $gt: now },
            plan_id: null
          });

          console.log("🔍 Individual subscription check:", {
            individualPlanSub: !!individualSubscription?.plan_id,
            noPlanSub: !!noPlanSubscription
          });

          if ((individualSubscription && individualSubscription.plan_id) || noPlanSubscription) {
            isSubscribed = true;
          }
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
      userSubscribed,
      data: result.data,
      related_movie: result.related_movie
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
