const { body, param, validationResult } = require("express-validator");

exports.movieValidationRules = {
    addMovie: [
        body("videos_id").isInt({ min: 1 }).withMessage("videos_id must be a positive integer"),
        body("title").notEmpty().withMessage("title is required"),
    ],
    getMovieById: [
        param("id").isInt({ min: 1 }).withMessage("Movie ID must be a positive integer"),
    ],
    updateMovie: [
        param("id").isInt({ min: 1 }).withMessage("Movie ID must be a positive integer"),
        body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    ],
    deleteMovie: [
        param("id").isInt({ min: 1 }).withMessage("Movie ID must be a positive integer"),
    ],
};

exports.SeriesValidationRules = {
    addMovie: [
        body("videos_id").isInt({ min: 1 }).withMessage("videos_id must be a positive integer"),
        body("title").notEmpty().withMessage("title is required"),
    ],
    getMovieById: [
        param("id").isInt({ min: 1 }).withMessage("Movie ID must be a positive integer"),
    ],
    updateMovie: [
        param("id").isInt({ min: 1 }).withMessage("Movie ID must be a positive integer"),
        body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    ],
    deleteMovie: [
        param("id").isInt({ min: 1 }).withMessage("Movie ID must be a positive integer"),
    ],
};

// Middleware to handle validation errors
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
