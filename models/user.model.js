const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  name: String,
  slug: { type: String, required: true },
  username: String,
  email: { type: String, required: true },
  is_password_set: { type: Number, required: true, default: 0 },
  password: { type: String, required: true },
  gender: { type: Number, default: 1 },
  role: String,
  token: String,
  theme: { type: String, default: 'default' },
  theme_color: { type: String, default: '#16163F' },
  join_date: Date,
  last_login: Date,
  deactivate_reason: String,
  status: { type: Number, required: true, default: 1 },
  phone: String,
  dob: Date,
  firebase_auth_uid: String,
  otp: { type: Number, required: true, default: 1234 },
  vstatus: { type: Number, required: true, default: 1 },
  deviceid: String,
  fcm: String,
  versioncode: { type: String, default: '1' }
}, {collection: "user" });

module.exports = mongoose.model('User', userSchema);
