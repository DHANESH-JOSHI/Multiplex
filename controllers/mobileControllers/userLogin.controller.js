// const commonService = require('../../services/api/common.service');
const crypto = require('crypto');
const sendOtp = require('../../config/sendOtp');
const User = require('../../models/user.model');
/**
 * POST /api/users/login
 * Log in a user.
 * Expected request body:
 * {
 *   "email": "user@example.com",
 *   "password": "plainTextPassword"
 * }
 */


function generateOtp() {
    const otp = crypto.randomInt(100000, 1000000); // 6-digit OTP
    return otp.toString();
}


exports.login = async (req, res) => {

    try {
        const { email, phone } = req.body;
        const mobile = phone;

        if (mobile) {
            return res.status(400).json({ message: "Mobile is required" });
        }

        // Extract name from email before the '@' symbol
        const extractedName = email.split('@')[0];

        const otp = generateOtp();
        const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

        let user = await User.findOne({ phone: mobile });

        if (user) {
            // User already exists, update OTP
            user.otp = otp;
            user.otpExpire = otpExpire;
            await user.save();
        } else {
            // New user create
            const lastUser = await User.findOne().sort({ user_id: -1 });
            let newUserId = 1;
            if (lastUser) {
                newUserId = lastUser.user_id + 1;
            }

            user = await User.create({
                user_id: newUserId,
                name: extractedName,    // Set the extracted name
                slug: extractedName,
                username: extractedName,
                email,
                is_password_set: 0,
                password: "e10adc3949ba59abbe56e057f20f883e",  // Example hash for default password
                gender: 1,
                role: "user",
                token: "",
                theme: "default",
                theme_color: "#16163F",
                join_date: new Date(),
                last_login: new Date(),
                deactivate_reason: "",
                status: 1,
                phone: mobile,
                dob: null,
                firebase_auth_uid: "",
                otp: otp,
                otpExpire: otpExpire,
                vstatus: 1,
                deviceid: "",
                fcm: "",
                versioncode: "1",
                google_id: "",
                profile_picture: ""
            });
        }

        // Send OTP to the mobile number
        await sendOtp(mobile, otp);

        // Send response with the user data and OTP message
        res.status(200).json({
            message: "OTP sent successfully",
            user: {
                user_id: user.user_id,
                name: user.name,
                username: user.username,
                email: user.email,
                phone: user.phone,
                otp: user.otp,
                otpExpire: user.otpExpire,
                join_date: user.join_date,
                last_login: user.last_login,
                status: user.status,
                role: user.role,
                theme: user.theme,
                theme_color: user.theme_color
            },
            otpMessage: `Your OTP is ${otp}`
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }

};


exports.verifyOtp = async (req, res) => {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
        return res.status(400).json({ message: "Mobile and OTP are required" });
    }

    const mobileNumber = mobile.toString(); // Ensure mobile is a string
    const otpString = otp.toString(); // Ensure OTP is a string

    console.log("Mobile:", mobileNumber, "OTP:", otpString);

    // Query the database with the correct field names
    const user = await User.findOne({ phone: mobileNumber });
    console.log(user.otp);
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    // Compare the OTPs
    if (user.otp !== otpString) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP is expired
    if (user.otpExpire < new Date()) {
        return res.status(400).json({ message: "OTP expired" });
    }

    // Clear OTP and OTP expiration time
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    res.status(200).json({ message: "Login successful", userId: user.user_id });
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
