const express = require("express");
const router = express.Router();

// Importing individual route modules
const configRoutes = require("./allRoutes/config.routes");
const movieRoutes = require("./allRoutes/movies.routes");
const favoriteRoutes = require("./allRoutes/favorite.routes");
const genreRoutes = require("./allRoutes/genre.routes");
const userLoginRoutes = require("./allRoutes/userLogin.routes");
const homeContentRoutes = require("./allRoutes/homeContent.routes");
const channelRoutes = require("./allRoutes/channel.routes");
const subscriptionRoutes = require("./allRoutes/subscription.routes");
const adminLoginRoutes = require("./allRoutes/adminLogin.routes");

// Assigning routes
router.use("/config", configRoutes);
router.use("/movies", movieRoutes);
router.use("/favorite", favoriteRoutes);
router.use("/genres", genreRoutes);
router.use("/user", userLoginRoutes); // User Login 
router.use("/home_content_for_android", homeContentRoutes);
router.use("/getchannellist", channelRoutes);
router.use("/check_user_subscription_status", subscriptionRoutes);
router.use("/adminlogin", adminLoginRoutes); // Admin Login

module.exports = router;
