const GenreService = require("../../services/adminServices/genre.service");

class GenreController {
    // Add Genre
    async addGenre(req, res) {
        try {
            const result = await GenreService.addGenre(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Get All Genres
    async getAllGenres(req, res) {
        try {
            const result = await GenreService.getAllGenres();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Get Genre by ID
    async getGenreById(req, res) {

        try {
            const id = req.params.id; // id 
            const idField = req.query.newKey; //query pass 
            const result = await GenreService.getGenreById(idField, id); 
            res.status(200).json(result);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }  

    // Update Genre
    async updateGenre(req, res) {
        try {
            const result = await GenreService.updateGenre(req.params.id, req.body);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Delete Genre
    async deleteGenre(req, res) {
        try {
            const result = await GenreService.deleteGenre(req.params.id);
            res.status(200).json(result);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
}

module.exports = new GenreController();
