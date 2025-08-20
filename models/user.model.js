const mongoose = require("mongoose");
const mongooseSequence = require("mongoose-sequence")(mongoose); // Pass mongoose here

const userSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      unique: true
    },
    name: String,
    slug: { type: String, required: false },
    username: String,
    email: String,
    is_password_set: { type: Number, required: true, default: 0 },
    password: { type: String, required: function() { 
      // Password not required for Firebase/OAuth users
      return !this.firebase_auth_uid && !this.google_id; 
    }},
    gender: { type: String, default: 1 },
    role: String,
    token: String,
    theme: { type: String, default: "default" },
    theme_color: { type: String, default: "#16163F" },

    join_date: Date,
    last_login: Date,
    deactivate_reason: String,
    status: { type: Number, required: true, default: 1 },
    phone: String,
    firebase_auth_uid: String,
    otp: {
      type: String,
      required: [false, "OTP is required"], // Or set to `false` if optional
      default: null, // This ensures OTP can be null if not set
    },
    otpExpire: { type: Date },
    vstatus: { type: Number, required: true, default: 1 },
    deviceid: { type: String },
    fcm: { type: String },
    versioncode: { type: String, default: "1" },
    // OAuth fields
    google_id: String,
    profile_picture: String,
  },
  { collection: "user" }
);

// Pre-save hook to automatically set user_id to _id
userSchema.pre('save', function(next) {
  if (!this.user_id) {
    this.user_id = this._id;
  }
  next();
});

// userSchema.plugin(mongooseSequence, {
//   inc_field: "user_id", 
// }); // Not needed since user_id = _id

module.exports = mongoose.model("User", userSchema);
