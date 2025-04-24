const express = require("express");
const router = express.Router();

// Importing individual route modules
// const commentRoutes = require('./mobileRoutes/comment.routes');
const countryRoutes = require('./mobileRoutes/country.routes');
const configRoutes = require("./mobileRoutes/config.routes");
const movieRoutes = require("./mobileRoutes/movies.routes");
const webseriesRoutes = require("./mobileRoutes/webseries.routes");
const favoriteRoutes = require("./mobileRoutes/favorite.routes");
const genreRoutes = require("./adminRoutes/genre.routes");
const userLoginRoutes = require("./mobileRoutes/userLogin.routes");
const homeContentRoutes = require("./mobileRoutes/homeContent.routes");
const channelRoutes = require("./adminRoutes/channel.routes");
const planRoutes = require("./adminRoutes/plan.routes");
const sliderRoutes = require("./adminRoutes/slider.routes");

// Mobile Routes
// router.use("/comment", commentRoutes);
router.use("/country", countryRoutes);
router.use("/config", configRoutes);
router.use("/movies", movieRoutes);
router.use("/webseries", webseriesRoutes);
router.use("/favorite", favoriteRoutes);
router.use("/genres", genreRoutes);
router.use("/user", userLoginRoutes); // User Login
router.use("/home_content_for_android", homeContentRoutes);
router.use("/channel", channelRoutes);
router.use("/all_package", planRoutes);
router.use("/slider", sliderRoutes);


//Import Admin Routes modules
const adminLoginRoutes = require("./adminRoutes/adminAuth.routes");
const addMovieRoutes = require("./adminRoutes/movies.routes");
const addWebseriesRoutes = require("./adminRoutes/webseries.routes");
const addPlanRoutes = require("./adminRoutes/plan.routes");
const addBannerRoutes = require("./adminRoutes/banner.routes");
const addPaymentrRoutes = require("./adminRoutes/payment.routes");

//Import Admin Routes
router.use("/adminauth", adminLoginRoutes); // Admin Login
router.use("/adminmovies", addMovieRoutes); // CURD of Movies
router.use("/adminwebseries", addWebseriesRoutes); //CRUD of Webseries
router.use("/adminplans", addPlanRoutes); //CURD of Plans
router.use("/adminbanner", addBannerRoutes); //CURD of Banner
router.use("/payment", addPaymentrRoutes); //CURD of payment

// Import Web Routes modules
const webAuthRoutes = require("./webRoutes/auth.routes");

// Web Routes
router.use("/web/auth", webAuthRoutes); // Web Authentication

module.exports = router;
