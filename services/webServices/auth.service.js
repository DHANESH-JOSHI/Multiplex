const User = require('../../models/user.model');
const md5 = require('md5');

/**
 * Find or create a user from Google OAuth profile
 * @param {Object} profile - Google OAuth profile
 * @returns {Promise<Object>} User object
 */
exports.findOrCreateGoogleUser = async (profile) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ google_id: profile.id });
    
    if (user) {
      // User exists, return the user
      return user;
    }
    
    // User doesn't exist, create a new one
    // First, get the last user_id
    const lastUser = await User.findOne({}, { user_id: 1 }).sort({ user_id: -1 });
    const newUserId = lastUser ? lastUser.user_id + 1 : 1;
    
    // Create a random password for the user
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = md5(randomPassword);
    
    // Create new user
    const newUser = new User({
      user_id: newUserId,
      name: profile.displayName,
      slug: profile.displayName.toLowerCase().replace(/\s+/g, '-'),
      email: profile.emails[0].value,
      is_password_set: 0, // Password is auto-generated
      password: hashedPassword,
      google_id: profile.id,
      role: 'user',
      join_date: new Date(),
      last_login: new Date(),
      status: 1
    });
    
    await newUser.save();
    return newUser;
  } catch (error) {
    console.error('Error in findOrCreateGoogleUser:', error);
    throw error;
  }
};
