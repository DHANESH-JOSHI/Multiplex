const express = require('express');
const router = express.Router();
const subscriptionController = require('../../controllers/api/subscription.controller');
const { getChannelListController } = require('../../controllers/api/channel.controller');
const HomeContentController = require('../../controllers/api/homeContent.controller');
const configController = require('../../controllers/api/config.controller');


//Mobile Apis
// router.post('/create', subscriptionController.createSubscription);
// route.get('/user', subscriptionController.getAllSubscriptions);
router.get('/config', configController.getFullConfig);

router.get('/home_content_for_android', HomeContentController.getHomeContentForAndroid);
router.get('/check_user_subscription_status', subscriptionController.getUserSubscriptionStatus);
router.get('/getchannellist', getChannelListController);




// GET all comments
const commentController = require('../../controllers/api/comment.controller');

router.get('/all_comments', commentController.getAllComments);

// POST create a new comment
router.post('/comment', commentController.createComment);

// GET a single comment by ID
router.get('/comment/:id', commentController.getCommentById);


//user Routes
const userController = require('../../controllers/api/user.controller');

// POST /api/users/login
router.post('/login', userController.login);







//genre routes
const GenreController = require('../../controllers/api/allgenre.controller');

router.get('/genres', GenreController.getAllGenres); // Get all genres
// router.get('/genres/:id', GenreController.getGenreById); // Get genre by ID


//Movie controllers
const movieController = require('../../controllers/api/movies.controller');
router.get('/movies', movieController.getAllMovies);
router.get('/movies/:id', movieController.getMovieById);
router.post('/movies', movieController.createMovie);
router.put('/movies/:id', movieController.updateMovie);
router.delete('/movies/:id', movieController.deleteMovie);

//Facvorite controllers
const FavoriteController = require("../../controllers/api/favorite.controller");

router.get("/favorite", FavoriteController.getFavorites);
router.post("/add_favorite", FavoriteController.addFavorite);
router.get("/verify", FavoriteController.verifyFavorite);
router.delete("/remove_favorite", FavoriteController.removeFavorite);





module.exports = router;