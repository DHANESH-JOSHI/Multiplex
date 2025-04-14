const videoSchema = require("../../models/videos.model");
const video_file = require("../../models/video_file.model");
const { BunnyService } = require("../../services/adminServices/bunnyCDN.service");
require("dotenv").config();

// Create a new movie with Bunny API integration
exports.addMovies = async (req, res) => {
    try {
        // const { title, description, genre, release, language, is_paid, trailler_youtube_source, image_url, publication, enable_download } = req.body;
        console.log(req.body);
        const bunnyData = {
            title: req.body.title || 'Untitled Video'
        };

        const config = {
            method: 'post',
            url: `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos`,
            headers: {
                'AccessKey': process.env.BUNNY_API_KEY,
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(bunnyData)
        };
        let response = await BunnyService(config);

        await video_file.create({ video_id: uuid.v4(), video_file_id: response.data.guid });

        res.send(response);

    } catch (error) {
        console.error("Error adding movie:", error);
        res.status(500).json({ message: "Error adding movie", error: error.message });
    }
};

exports.uploadVideo = async (req, res) => {
    try {

        let { id } = req.params;

        const config = {
            method: 'put',
            url: `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${id}?jitEnabled=true&enabledResolutions=${process.env.BUNNY_RESOLUTION}`,
            maxBodyLength: Infinity,
            headers: {
                'AccessKey': process.env.BUNNY_API_KEY,
                'Content-Type': 'video/mp4'
            },
            data: req.body
        };
        let response = await BunnyService(config);
        // videoSchema.updateOne();
        res.send(response);

    } catch (error) {
        console.error("Error adding movie:", error);
        res.status(500).json({ message: "Error adding movie", error: error.message });
    }
};

// Get all movies with error handling
exports.getAllMovies = async (req, res) => {
    try {
        const movies = await videoSchema.find().populate("director writer country genre");
        res.status(200).json({ message: "Movies retrieved successfully", data: movies });
    } catch (error) {
        console.error("Error fetching movies:", error);
        res.status(500).json({ message: "Error fetching movies", error: error.message });
    }
};

// Get a single movie by ID with error handling
exports.getMovieById = async (req, res) => {
    try {
        const movie = await videoSchema.findById(req.params.id).populate("director writer country genre");
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        // Try to get additional info from Bunny API
        try {
            if (movie.bunny_id) {
                const bunnyResponse = await bunnyService.getVideo(movie.bunny_id);
                if (bunnyResponse.success && bunnyResponse.data) {
                    return res.status(200).json({
                        message: "Movie retrieved successfully",
                        data: {
                            ...movie.toObject(),
                            bunny_data: bunnyResponse.data
                        }
                    });
                }
            }
        } catch (bunnyError) {
            console.warn("Could not fetch Bunny data for movie:", bunnyError.message);
        }

        res.status(200).json({ message: "Movie retrieved successfully", data: movie });
    } catch (error) {
        console.error(`Error fetching movie ${req.params.id}:`, error);
        res.status(500).json({ message: "Error fetching movie", error: error.message });
    }
};

// Update a movie by ID with error handling
exports.updateMovie = async (req, res) => {
    try {
        const movie = await videoSchema.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        // Update in Bunny API if we have a bunny_id
        if (movie.bunny_id && (req.body.title || req.body.description)) {
            try {
                // Update with new data
                const updateData = {
                    title: req.body.title,
                    description: req.body.description,
                    collection_id: req.body.collection_id
                };

                const bunnyUpdateResponse = await bunnyService.updateVideo(movie.bunny_id, updateData);
                if (!bunnyUpdateResponse.success) {
                    console.warn("Could not update Bunny data for movie:", bunnyUpdateResponse.message);
                }
            } catch (bunnyError) {
                console.warn("Error updating Bunny data for movie:", bunnyError.message);
            }
        }

        // Update in database
        const updatedMovie = await videoSchema.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // If file data is provided, upload it to Bunny
        if (req.file && req.file.buffer && movie.bunny_id) {
            try {
                const uploadResponse = await bunnyService.uploadVideoFile(
                    movie.bunny_id,
                    req.file.buffer
                );

                if (!uploadResponse.success) {
                    console.warn("Movie updated but file upload failed:", uploadResponse.message);
                }
            } catch (uploadError) {
                console.warn("Error uploading file to Bunny:", uploadError.message);
            }
        }

        res.status(200).json({ message: "Movie updated successfully", data: updatedMovie });
    } catch (error) {
        console.error(`Error updating movie ${req.params.id}:`, error);
        res.status(500).json({ message: "Error updating movie", error: error.message });
    }
};

// Delete a movie by ID with error handling
exports.deleteMovie = async (req, res) => {
    try {
        const movie = await videoSchema.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        // Delete from Bunny API if we have a bunny_id
        if (movie.bunny_id) {
            try {
                const bunnyResponse = await bunnyService.deleteVideo(movie.bunny_id);
                if (!bunnyResponse.success) {
                    console.warn("Could not delete from Bunny API:", bunnyResponse.message);
                }
            } catch (bunnyError) {
                console.warn("Error deleting from Bunny API:", bunnyError.message);
            }
        }

        // Delete from database
        await videoSchema.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Movie deleted successfully" });
    } catch (error) {
        console.error(`Error deleting movie ${req.params.id}:`, error);
        res.status(500).json({ message: "Error deleting movie", error: error.message });
    }
};
