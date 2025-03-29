const express = require("express");
const router = express.Router();

// Importing individual route modules
const movieRoutes = require("./allRoutes/movies.routes");
const favoriteRoutes = require("./allRoutes/favorite.routes");
const genreRoutes = require("./allRoutes/genre.routes");
const userRoutes = require("./allRoutes/user.routes");
const homeContentRoutes = require("./allRoutes/homeContent.routes");
const channelRoutes = require("./allRoutes/channel.routes");
const subscriptionRoutes = require("./allRoutes/subscription.routes");
const loginRoutes = require("./allRoutes/login.routes");

// Assigning routes
router.use("/movies", movieRoutes);
router.use("/favorite", favoriteRoutes);
router.use("/genres", genreRoutes);
router.use("/user", userRoutes);
router.use("/home_content_for_android", homeContentRoutes);
router.use("/getchannellist", channelRoutes);
router.use("/check_user_subscription_status", subscriptionRoutes);
router.use("/do-login", loginRoutes);

module.exports = router;
