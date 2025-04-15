const User = require('../../models/user.model');
const md5 = require('md5');
const passport = require('passport');

/**
 * Web login controller - handles login with email/mobile and password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.login = async (req, res) => {
  try {
    // Get email/mobile and password from request body
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email/mobile number and password are required'
      });
    }

    // Hash the password with MD5
    const hashedPassword = md5(password);

    // Check if identifier is email or mobile
    const isEmail = identifier.includes('@');

    // Find user by email or mobile
    let user;
    if (isEmail) {
      user = await User.findOne({ email: identifier, password: hashedPassword, status: 1 });
    } else {
      user = await User.findOne({ phone: identifier, password: hashedPassword, status: 1 });
    }

    // If user not found
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials. Please try again.'
      });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Create response object (remove sensitive data)
    const userResponse = {
      status: 'success',
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      join_date: user.join_date,
      last_login: user.last_login
    };

    return res.status(200).json(userResponse);

  } catch (error) {
    console.error('Error in web login:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Initiates Google OAuth authentication
 */
exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

/**
 * Google OAuth callback handler
 */
exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', {
    failureRedirect: '/login'
  }, async (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.redirect('/login?error=auth_failed');
    }

    // User authenticated successfully
    // Update last login
    user.last_login = new Date();
    await user.save();

    // Redirect to frontend with success token or data
    // You can use JWT here to create a token
    return res.redirect(`/auth/success?userId=${user.user_id}`);

  })(req, res, next);
};
