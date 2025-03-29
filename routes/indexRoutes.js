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
const adminLoginRoutes = require("./adminAuthroutes");

// Assigning routes
router.use("/config", configRoutes);
router.use("/movies", movieRoutes);
router.use("/favorite", favoriteRoutes);
router.use("/genres", genreRoutes);
router.use("/user", userLoginRoutes); // User Login 
router.use("/home_content_for_android", homeContentRoutes);
router.use("/getchannellist", channelRoutes);
router.use("/check_user_subscription_status", subscriptionRoutes);
router.use("/adminauth", adminLoginRoutes); // Admin Login

module.exports = router;
