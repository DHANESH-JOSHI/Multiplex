const Genre = require("../../models/genre.model");
const Movie = require("../../models/videos.model");
const CRUDService = require("../../services/crud.service");
const path = require("path");
const fs = require("fs");

class GenreService {
    // Add Genre with Image File & URL Support
    async addGenre(genreData) {
        try {
            // Validate required fields
            if (!genreData.name || !genreData.slug) {
                throw new Error("Name and slug are required fields.");
            }

            // Check if Genre already exists
            const existingGenre = await Genre.findOne({ slug: genreData.slug });
            if (existingGenre) {
                throw new Error("Genre with this slug already exists.");
            }

            // Handle Image (File or URL)
            const defaultImage = "uploads/default_image/genre.png";
            if (genreData.image) {
                if (genreData.image.startsWith("http")) {
                    // If it's a URL, store it as it is
                    genreData.image = genreData.image;
                } else {
                    // If it's a file name, store it in the uploads folder
                    genreData.image = `uploads/genres/${genreData.image}`;
                }
            } else {
                // If no image is provided, use default
                genreData.image = defaultImage;
            }

            // Save Genre
            return await CRUDService.create(Genre, genreData);
        } catch (error) {
            throw new Error(`Failed to add genre: ${error.message}`);
        }
    }

    // Get All Genres
    async getAllGenres() {
        try {
            const genres = await CRUDService.getAll(Genre);
            if (!genres.data.length) {
                throw new Error("No genres found.");
            }
            return genres;
        } catch (error) {
            throw new Error(`Failed to fetch genres: ${error.message}`);
        }
    }

    // Get Genre by ID
    async getGenreById(idField, id) {
        try {
            console.log(idField, id);
            if (!id) throw new Error("Genre ID is required.");
            console.log(idField);
            const genre = await CRUDService.getById(Genre, idField, id);
            if (!genre.data) throw new Error("Genre not found.");
            return genre;

        } catch (error) {
            throw new Error(`${error}`);
        }
    }

    async ContentByGenreId(idField, id) {
        try {
            if (!id) throw new Error("Genre ID is required.");
            const genre = await CRUDService.getById(Movie, idField, id);
            if (!genre.data) throw new Error("Genre not found.");
            return genre;

        } catch (error) {
            throw new Error(`${error}`);
        }
    }

    // Update Genre with Image Handling
    async updateGenre(genreId, genreData) {
        try {
            if (!genreId) throw new Error("Genre ID is required.");
            if (!genreData.name || !genreData.slug) {
                throw new Error("Name and slug are required fields.");
            }

            // Check if Genre exists
            const existingGenre = await Genre.findById(genreId);
            if (!existingGenre) throw new Error("Genre not found.");

            // Check if slug is unique
            const genreWithSameSlug = await Genre.findOne({ slug: genreData.slug, _id: { $ne: genreId } });
            if (genreWithSameSlug) {
                throw new Error("Another genre with this slug already exists.");
            }

            // Handle Image (File or URL)
            if (genreData.image) {
                if (genreData.image.startsWith("http")) {
                    // Store the URL as it is
                    genreData.image = genreData.image;
                } else {
                    // Store the file path
                    genreData.image = `uploads/genres/${genreData.image}`;
                }
            }

            return await CRUDService.update(Genre, genreId, genreData);
        } catch (error) {
            throw new Error(`Failed to update genre: ${error.message}`);
        }
    }

    // Delete Genre with Image File Deletion
    async deleteGenre(genreId) {
        try {
            if (!genreId) throw new Error("Genre ID is required.");

            const genre = await Genre.findById(genreId);
            if (!genre) throw new Error("Genre not found.");

            //  Delete image file if it's stored locally
            if (genre.image && !genre.image.startsWith("http") && genre.image !== "uploads/default_image/genre.png") {
                const imagePath = path.join(__dirname, "../../", genre.image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            return await CRUDService.delete(Genre, genreId);
        } catch (error) {
            throw new Error(`Failed to delete genre: ${error.message}`);
        }
    }
}

module.exports = new GenreService();
