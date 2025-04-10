module.exports = (req, res, next) => {
  const apiKey = req.headers['api-key'];
  if (apiKey && apiKey === 'ec8590cb04e0e37c6706ab6c') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
};
