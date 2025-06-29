module.exports = (title, body, data = {}) => ({
  notification: { title, body },
  data,
});