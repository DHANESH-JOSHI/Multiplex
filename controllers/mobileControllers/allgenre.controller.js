const GenreService = require('../../services/mobileServices/genre.service');

const getAllGenres = async (req, res) => {
  try {
    const data = await GenreService.getGenres();
    res.json(data);
  } catch (err) {
    console.error('Error in GenreController:', err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getAllGenres };
