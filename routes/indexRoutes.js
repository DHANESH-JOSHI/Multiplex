const express = require("express");
const router = express.Router();

// Importing individual route modules
const configRoutes = require("./mobileRoutes/config.routes");
const movieRoutes = require("./mobileRoutes/movies.routes");
const favoriteRoutes = require("./mobileRoutes/favorite.routes");
const genreRoutes = require("./mobileRoutes/genre.routes");
const userLoginRoutes = require("./mobileRoutes/userLogin.routes");
const homeContentRoutes = require("./mobileRoutes/homeContent.routes");
const channelRoutes = require("./mobileRoutes/channel.routes");
const subscriptionRoutes = require("./mobileRoutes/subscription.routes");

// Mobile Routes
router.use("/config", configRoutes);
router.use("/movies", movieRoutes);
router.use("/favorite", favoriteRoutes);
router.use("/genres", genreRoutes);
router.use("/user", userLoginRoutes); // User Login 
router.use("/home_content_for_android", homeContentRoutes);
router.use("/getchannellist", channelRoutes);
router.use("/check_user_subscription_status", subscriptionRoutes);


//Import Admin Routes modules
const adminLoginRoutes = require("./multiplexPlayRoutes/adminAuth.routes");
const addMovieRoutes = require("./multiplexPlayRoutes/addMovies.routes");
const addWebseriesRoutes = require("./multiplexPlayRoutes/addWebseries.routes");
//Import Admin Routes
router.use("/adminauth", adminLoginRoutes); // Admin Login
router.use("/adminmovies", addMovieRoutes); // CURD of Movies
router.use("/adminwebseries", addWebseriesRoutes); //CRUD of Webseries

module.exports = router;
