const Genre = require('../../models/genre.model.js');

const getGenres = async () => {
  const allGenres = await Genre.find().lean();
  console.log(allGenres);
  return allGenres.map(g => ({
    genre_id: g.genre_id,
    name: g.name,
    description: g.description || "No description available",
    slug: g.slug,
    url: `https://multiplexplay.com/office/genre/${g.slug}`,
    image_url: g.image_url || "https://multiplexplay.com/office/uploads/default_image/genre.png"
  }));
};

module.exports = { getGenres };
