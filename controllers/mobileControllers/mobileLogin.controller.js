const userService = require('../../services/mobileServices/userLogin.service');
const crypto = require('crypto');

exports.mobileLogin = async (req, res) => {
  try {
    
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({ status: 'error', data: 'Internal server error' });
  }
};
