const userService = require('../../services/api/userLogin.service');
// const commonService = require('../../services/api/common.service');
const crypto = require('crypto');

/**
 * POST /api/users/login
 * Log in a user.
 * Expected request body:
 * {
 *   "email": "user@example.com",
 *   "password": "plainTextPassword"
 * }
 */
exports.login = async (req, res) => {
  try {
    const email = (req.body.email || '').trim();
    const passwordInput = (req.body.password || '').trim();

    // Validate email and password inputs
    if (!validateEmail(email) || !passwordInput) {
      return res.status(400).json({ status: 'error', data: 'Please enter valid email & password.' });
    }

    // Compute MD5 hash of the password
    const password = crypto.createHash('md5').update(passwordInput).digest('hex');

    // Validate user existence
    const loginStatus = await userService.validateUser(email, password);
    if (loginStatus) {
      // Retrieve user info
      const userInfo = await userService.getUserInfo(email, password);
      // Update last login
      await userService.updateLastLogin(userInfo.user_id);

      // Build response
      const response = {
        status: 'success',
        user_id: userInfo.user_id,
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        password_available: true,
        image_url: userInfo.image_url,
        gender: "Unknown",
        join_date: userInfo.join_date,
        last_login: userInfo.last_login
      };

      // Determine gender string based on the gender field
      if (userInfo.gender === 1 || userInfo.gender === '1') {
        response.gender = "Male";
      } else if (userInfo.gender === 0 || userInfo.gender === '0') {
        response.gender = "Female";
      }

      return res.status(200).json(response);
    } else {
      return res.status(400).json({ status: 'error', data: 'Email & username not match.Please try again.' });
    }
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({ status: 'error', data: 'Internal server error' });
  }
};

/**
 * Validate the email format using a simple regex.
 * @param {string} email 
 * @returns {boolean}
 */
function validateEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}
