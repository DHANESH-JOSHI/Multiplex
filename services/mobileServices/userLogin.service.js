const User = require('../../models/user.model');

/**
 * Validate if a user exists by email, password and active status.
 * @param {string} email - User email.
 * @param {string} password - MD5 hashed password.
 * @returns {Promise<boolean>} True if the user exists; otherwise false.
 */
exports.validateUser = async (email, password) => {
  try {
    const user = await User.findOne({ email, password, status: 1 });
    return !!user;
  } catch (error) {
    throw new Error('Error validating user: ' + error.message);
  }
};

/**
 * Retrieve user info by email and password.
 * @param {string} email - User email.
 * @param {string} password - MD5 hashed password.
 * @returns {Promise<Object|null>} The user document, or null if not found.
 */
exports.getUserInfo = async (email, password) => {
  try {
    return await User.findOne({ email, password, status: 1 });
  } catch (error) {
    throw new Error('Error retrieving user info: ' + error.message);
  }
};

/**
 * Update the last login date for a user by their custom user_id.
 * @param {number} userId - The user's user_id.
 * @returns {Promise<Object|null>} The updated user document, or null if not found.
 */
exports.updateLastLogin = async (userId) => {
  try {
    const now = new Date();
    return await User.findOneAndUpdate({ user_id: userId }, { last_login: now }, { new: true });
  } catch (error) {
    throw new Error('Error updating last login: ' + error.message);
  }
};
