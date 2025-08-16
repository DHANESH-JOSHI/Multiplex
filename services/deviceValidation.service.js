const User = require('../models/user.model');
const mongoose = require('mongoose');

const DeviceValidationService = {
  
  /**
   * Validate if user can access content from their registered device
   * @param {string} userId - User ID 
   * @param {string} deviceId - Current device ID
   * @returns {Promise<Object>} - Validation result
   */
  async validateDeviceAccess(userId, deviceId) {
    try {
      if (!userId || !deviceId) {
        return {
          isValid: false,
          message: 'User ID and Device ID are required',
          errorCode: 'MISSING_CREDENTIALS'
        };
      }

      // Find user by appropriate field based on ID type
      let user;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        // If it's ObjectId, search by _id
        user = await User.findById(userId);
      } else {
        // If it's number, search by user_id
        user = await User.findOne({ user_id: parseInt(userId) });
      }
      
      if (!user) {
        return {
          isValid: false,
          message: 'User not found',
          errorCode: 'USER_NOT_FOUND'
        };
      }

      // Check if user has registered device
      if (!user.deviceid) {
        return {
          isValid: false,
          message: 'No device registered for this user. Please login again.',
          errorCode: 'NO_DEVICE_REGISTERED'
        };
      }

      // Validate device ID match
      if (user.deviceid !== deviceId) {
        return {
          isValid: false,
          message: 'Device not authorized. Please login from registered device.',
          errorCode: 'DEVICE_MISMATCH'
        };
      }

      // Check for concurrent sessions (same device used by multiple accounts)
      let concurrentQuery;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        concurrentQuery = { 
          deviceid: deviceId,
          _id: { $ne: userId }
        };
      } else {
        concurrentQuery = { 
          deviceid: deviceId,
          user_id: { $ne: parseInt(userId) }
        };
      }
      
      const concurrentUsers = await User.find(concurrentQuery);

      if (concurrentUsers.length > 0) {
        return {
          isValid: false,
          message: 'Device is being used by another account. Multiple sessions not allowed.',
          errorCode: 'CONCURRENT_SESSION'
        };
      }

      return {
        isValid: true,
        message: 'Device access authorized',
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          deviceid: user.deviceid
        }
      };

    } catch (error) {
      console.error('❌ Device validation error:', error);
      return {
        isValid: false,
        message: 'Device validation failed',
        errorCode: 'VALIDATION_ERROR',
        error: error.message
      };
    }
  },

  /**
   * Update user's device ID (during login)
   * @param {string} userId - User ID
   * @param {string} newDeviceId - New device ID
   * @returns {Promise<boolean>} - Update success
   */
  async updateUserDevice(userId, newDeviceId) {
    try {
      if (!userId || !newDeviceId) {
        console.warn('❌ Missing userId or deviceId for update');
        return false;
      }

      // Check if device is already used by another user
      const existingUser = await User.findOne({ 
        deviceid: newDeviceId,
        user_id: { $ne: userId }
      });

      if (existingUser) {
        console.warn(`❌ Device ${newDeviceId} already registered to user ${existingUser.user_id}`);
        return false;
      }

      // Update user's device based on ID type
      let updateQuery;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        updateQuery = { _id: userId };
      } else {
        updateQuery = { user_id: parseInt(userId) };
      }
      
      const result = await User.updateOne(
        updateQuery,
        { $set: { deviceid: newDeviceId, last_login: new Date() } }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ Device updated for user ${userId}: ${newDeviceId}`);
        return true;
      } else {
        console.warn(`❌ Failed to update device for user ${userId}`);
        return false;
      }

    } catch (error) {
      console.error('❌ Error updating user device:', error);
      return false;
    }
  },

  /**
   * Check if device is already registered to another user
   * @param {string} deviceId - Device ID to check
   * @param {string} excludeUserId - User ID to exclude from check
   * @returns {Promise<Object>} - Check result
   */
  async checkDeviceConflict(deviceId, excludeUserId = null) {
    try {
      let query = { deviceid: deviceId };
      if (excludeUserId) {
        if (mongoose.Types.ObjectId.isValid(excludeUserId)) {
          query._id = { $ne: excludeUserId };
        } else {
          query.user_id = { $ne: parseInt(excludeUserId) };
        }
      }

      const conflictingUser = await User.findOne(query);
      
      if (conflictingUser) {
        return {
          hasConflict: true,
          conflictingUserId: conflictingUser.user_id,
          message: `Device already registered to user ${conflictingUser.user_id}`
        };
      }

      return {
        hasConflict: false,
        message: 'Device is available'
      };

    } catch (error) {
      console.error('❌ Error checking device conflict:', error);
      return {
        hasConflict: true,
        message: 'Error checking device availability',
        error: error.message
      };
    }
  },

  /**
   * Force logout user from device (admin function)
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Logout success
   */
  async forceDeviceLogout(userId) {
    try {
      let query;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        query = { _id: userId };
      } else {
        query = { user_id: parseInt(userId) };
      }
      
      const result = await User.updateOne(
        query,
        { $unset: { deviceid: 1, token: 1 } }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ User ${userId} logged out from device`);
        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ Error forcing device logout:', error);
      return false;
    }
  }
};

module.exports = DeviceValidationService;
