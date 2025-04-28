const NodeCache = require("node-cache");
const myCache = new NodeCache();

const cacheMiddleware = (duration) => {
    return (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }
      const key = req.originalUrl;
      const cachedResponse = myCache.get(key);
      if (cachedResponse) {
        return res.send(cachedResponse);
      } else {
        res.originalSend = res.send;
        res.send = (body) => {
          myCache.set(key, body, duration);
          return res.originalSend(body);
        };
        next();
      }
    };
  };

module.exports = { cacheMiddleware };