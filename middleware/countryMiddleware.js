module.exports = function (req, res, next) {
    const countryParam = req.query.country || req.headers['x-country'] || 'IN';
    req.country = countryParam.split(','); // support multiple
    next();
};
