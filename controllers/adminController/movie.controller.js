const MovieService = require("../../services/adminServices/movie.service");


class MovieController {
    // Add a new movie
    async addMovie(req, res) {
        try {
            const { title, genre } = req.body;
            const file = req.file?.path ||  null;
            
            if (!file) return res.status(400).json({ message: 'File is required' });
            try {
              const movie = await MovieService.addMovie({ title, genre, file });
              res.json({ success: true, movie });
            } catch (err) {
              res.status(400).json({ message: err.message });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Get all movies
    async getAllMovies(req, res) {
        try {
            const result = await MovieService.getAllMovies(req.query);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }


    //  Get movie by ID
    async getMovieById(req, res) {
        try {
            const movieId = req.query.vId;
            const fieldAliases = {
                video_id: "videos_id",
                vid: "videos_id",
            };
            
            const rawField = req.query.fieldKey;
            const fieldName = fieldAliases[rawField] || rawField || "_id";
            const result = await MovieService.getMovieById(movieId, fieldName); 
            res.status(200).json(result);
        } catch (error) {
            const statusCode = error.message.includes("not found") ? 404 : 500;
            res.status(statusCode).json({ message: error.message });
        }
    }
    
    
    

    // Update movie
    async updateMovie(req, res) {
        try {
            const result = await MovieService.updateMovie(req.params.id, req.body);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Delete movie
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
