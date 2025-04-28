const mongoose = require('mongoose');
const mongooseSequence = require("mongoose-sequence")(mongoose); // Pass mongoose here


const userSchema = new mongoose.Schema({
  user_id: { type: Number, required: true, unique: true },
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
  otp: {
    type: String,
    required: [false, 'OTP is required'], // Or set to `false` if optional
    default: null  // This ensures OTP can be null if not set
  },
  otpExpire: { type: Date },
  vstatus: { type: Number, required: true, default: 1 },
  deviceid: String,
  fcm: String,
  versioncode: { type: String, default: '1' },
  // OAuth fields
  google_id: String,
  profile_picture: String
}, {collection: "user" });


userSchema.plugin(mongooseSequence, {
  inc_field: "user_id", 
});

module.exports = mongoose.model('User', userSchema);
