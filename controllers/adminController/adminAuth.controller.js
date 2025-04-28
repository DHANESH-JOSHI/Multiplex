const mongoose = require('mongoose');
const userSchema = require('../../models/user.model');
const channelSchema = require('../../models/channel.model');
const crypto = require('crypto');
const sendOtp = require('../../config/sendOtp');

const md5 = require('md5');
require('dotenv').config();

// Login function
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const user = await userSchema.findOne({ email });

        // If user not found OR password doesn't match
        if (!user || user.password !== md5(password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Remove password field from response
        const userObj = user.toObject();
        delete userObj.password;

        // Login success response
        res.status(200).json({ message: 'Login successful', user: userObj });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.registration = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { channel_name, user, email, password, first_name, last_name, mobile_number, organization_name, address, role } = req.body;

        // Get last channel_id and user_id
        const lastChannel = await channelSchema.findOne({}, { channel_id: 1 }).sort({ channel_id: -1 });
        const lastUser = await userSchema.findOne({}, { user_id: 1 }).sort({ user_id: -1 });

        console.log(lastChannel, lastUser);
        const newChannelId = lastChannel ? lastChannel.channel_id + 1 : 1;
        const newUserId = lastUser ? lastUser.user_id + 1 : 1;

        console.log(newChannelId, newUserId);
        // Create new user
        const newUser = new userSchema({
            user_id: newUserId,
            name: first_name + ' ' + last_name,
            slug: first_name.toLowerCase() + '-' + last_name.toLowerCase(),
            email,
            password,
            role: role || 'user',
            phone: mobile_number,
            join_date: new Date(),
            last_login: new Date(),
            status: 1
        });

        // Create new channel
        const newChannel = new channelSchema({
            channel_id: newChannelId,
            channel_name,
            user_id: newUserId.toString(),
            email,
            password,
            first_name,
            last_name,
            mobile_number,
            organization_name,
            address,
            join_date: new Date(),
            last_login: new Date(),
            status: 'pending'
        });

        await newUser.save({ session });
        await newChannel.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ message: 'User and Channel registered successfully', user: newUser, channel: newChannel });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Registration Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


function generateOtp() {
    const otp = crypto.randomInt(100000, 1000000); // 6-digit OTP
    return otp.toString();
}

// Send OTP (Register or Login)
exports.sendOtp = async (req, res) => {
    const { email, mobile } = req.body;

    if (!email || !mobile) {
        return res.status(400).json({ message: "Email and Mobile are required" });
    }

    const otp = generateOtp();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 min

    let user = await User.findOne({ mobile });

    if (user) {
        user.otp = otp;
        user.otpExpire = otpExpire;
        await user.save();
    } else {
        user = await User.create({ email, mobile, otp, otpExpire });
    }

    await sendOtp(mobile, otp); // <-- Send OTP on Mobile

    res.status(200).json({ message: "OTP sent successfully" });
};

