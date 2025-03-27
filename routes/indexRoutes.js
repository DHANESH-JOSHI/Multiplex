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

// Assigning routes
router.use("/movies", movieRoutes);
router.use("/favorite", favoriteRoutes);
router.use("/genres", genreRoutes);
router.use("/user", userRoutes);
router.use("/", homeContentRoutes);
router.use("/channel", channelRoutes);
router.use("/subscription", subscriptionRoutes);

module.exports = router;
