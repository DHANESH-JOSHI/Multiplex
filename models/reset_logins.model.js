// models/rest_login.model.js
const mongoose = require('mongoose');

const restLoginSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: Number, required: true, default: 1 }
});

module.exports = mongoose.model('RestLogin', restLoginSchema);
