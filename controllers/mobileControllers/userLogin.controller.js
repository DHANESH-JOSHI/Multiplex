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
        // Check if request body exists and is valid
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ 
                success: false,
                message: "Request body is required. Please send valid JSON data." 
            });
        }

        const { email, phone } = req.body;
        const mobile = phone;
            
        // Either email OR phone is required, not both
        if (!mobile && !email) {
            return res.status(400).json({ 
                success: false,
                message: "Either mobile number or email is required" 
            });
        }

        // Extract name from email before the '@' symbol, or use phone if email not provided
        const extractedName = email ? email.split('@')[0] : `user_${mobile || Math.floor(Math.random() * 10000)}`;

        const otp = generateOtp();
        const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

        // Find user by phone or email (whichever is provided)
        let user = mobile ? await User.findOne({ phone: mobile }) : await User.findOne({ email });

        if (user) {
            // User already exists, update OTP
            user.otp = otp;
            user.otpExpire = otpExpire;
            await user.save();
        } else {
            // New user create
            const lastUser = await User.findOne().sort({ user_id: -1 });
            let newUserId = 1;
            if (lastUser && lastUser.user_id && !isNaN(lastUser.user_id)) {
                newUserId = parseInt(lastUser.user_id) + 1;
            }
            
            console.log("Creating new user with ID:", newUserId);

            user = await User.create({
                user_id: newUserId,
                name: extractedName,    // ✅ Fixed: Use extracted name from email
                slug: newUserId,
                username: newUserId,
                email: email || "",
                is_password_set: 0,
                password: "25f9e794323b453885f5181f1b624d0b",  // Example hash for default password
                gender: 1,
                role: "user",
                token: "",
                theme: "default",
                theme_color: "#16163F",
                join_date: new Date(),
                last_login: new Date(),
                deactivate_reason: "",
                status: 1,
                phone: mobile || "",
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

        // Send OTP to the mobile number (only if mobile is provided)
        if (mobile) {
            await sendOtp(mobile, otp);
        }
        // console.log(otp);
        // Send response with the user data and OTP message
        res.status(200).json({
            success: true,
            message: mobile ? "OTP sent successfully" : "User logged in with email",
            user: {
                user_id: user._id,           // ✅ MongoDB ObjectId as user_id
                mongodb_id: user._id,        // ✅ Explicit MongoDB ID
                name: user.name,
                username: user.username,
                email: user.email,
                phone: user.phone,
                otp: user.otp,               // ✅ OTP for verification
                otpExpire: user.otpExpire,
                join_date: user.join_date,
                last_login: user.last_login,
                status: user.status,
                role: user.role,
                theme: user.theme,
                theme_color: user.theme_color,
                profile_picture: user.profile_picture
            },
            ...(mobile && { otpMessage: `Your OTP is ${otp}` })
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }

};


exports.verifyOtp = async (req, res) => {
    try {
        // Check if request body exists and is valid
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ 
                success: false,
                message: "Request body is required. Please send valid JSON data." 
            });
        }

        const { user_id, otp, deviceid, fcm, versioncode } = req.body;

        if (!user_id || !otp) { 
            return res.status(400).json({ 
                success: false,
                message: "User ID and OTP are required" 
            });
        }

    const otpString = otp.toString(); // Ensure OTP is a string    
    // Find user by user_id
        const user = await User.findOne({ _id: user_id });

        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: "User not found" 
            });
        }

        // Compare the OTPs
        if (user.otp !== otpString) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid OTP" 
            });
        }

        // Check if OTP is expired
        if (user.otpExpire < new Date()) {
            return res.status(400).json({ 
                success: false,
                message: "OTP expired" 
            });
        }

        // Update user info
        user.otp = null;
        user.otpExpire = null;
        user.deviceid = deviceid || null;
        user.fcm = fcm || null;

        await user.save();
        
        res.status(200).json({
            success: true,
            message: "Login successful",
            user_id: user._id,           // ✅ MongoDB ObjectId as user_id
            mongodb_id: user._id,        // ✅ Explicit MongoDB ID
            userId: user._id,            // ✅ Keep for backward compatibility
            name: user.name,
            email: user.email,
            phone: user.phone,
            username: user.username,
            role: user.role,
            theme: user.theme,
            theme_color: user.theme_color,
            join_date: user.join_date,
            last_login: user.last_login,
            status: "success",
            profile_picture: user.profile_picture,
            deviceid: user.deviceid,
            fcm: user.fcm,
            versioncode: user.versioncode
        });

    } catch (err) {
        console.error("OTP Verification Error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error", 
            error: err.message 
        });
    }
};





// Firebase_auth
// Firebase Auth Entry Point
exports.firebaseAuth = async (req, res) => {
    try {
        const { uid, phone, email, name, image_url, deviceid, fcm, versioncode } = req.body;
        console.log(req.body);
        const country = req.query.country || 'IN';
        const apiKey = req.headers['api-key'];

        if (!uid) return res.status(400).json({ message: "UID is required" });

        let user = null;

        // 🌐 GOOGLE AUTH - Allow empty phone for Google auth
        // if (email && name && image_url && deviceid && fcm && versioncode) {
            if (!validateEmail(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }

            user = await User.findOne({ email });
            if (!user) {
                const lastUser = await User.findOne().sort({ user_id: -1 });
                let newUserId = 1;
                if (lastUser && lastUser.user_id && !isNaN(lastUser.user_id)) {
                    newUserId = parseInt(lastUser.user_id) + 1;
                }

                user = await User.create({
                    user_id: newUserId,
                    name,
                    slug: newUserId,
                    username: newUserId,
                    email,
                    phone,
                    google_id: uid,
                    profile_picture: image_url,
                    deviceid,
                    fcm,
                    versioncode,
                    firebase_auth_uid: uid,
                    theme: 'default',
                    theme_color: '#16163F',
                    role: 'user',
                    join_date: new Date(),
                    gender: "male",
                    last_login: new Date(),
                    is_password_set: 0,
                    password: "25f9e794323b453885f5181f1b624d0b",
                    status: 1,
                    vstatus: 1
                });
                console.log("✅ New user created via Firebase auth:", user.email);
            } else {
                // Update existing user data (device ID, FCM, last login)
                console.log("🔄 Updating existing user data:", user.email);
                
                user.deviceid = deviceid || user.deviceid;          // Update device ID
                user.fcm = fcm || user.fcm;                        // Update FCM token
                user.versioncode = versioncode || user.versioncode; // Update version code
                user.last_login = new Date();                      // Update last login
                user.firebase_auth_uid = uid;                      // Ensure Firebase UID is set
                user.profile_picture = image_url || user.profile_picture; // Update profile picture
                user.name = name || user.name;                     // Update name if provided
                
                await user.save();
                console.log("✅ User data updated - Device ID:", user.deviceid, "FCM:", user.fcm?.substring(0, 20) + "...");
            }

        // ☎️ PHONE AUTH - Only if phone has actual value (not empty)
        // } 
        // else if (phone && phone.trim() !== '') {
        //     user = await User.findOne({ phone });
        //     const otp = generateOtp();
        //     const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

        //     if (user) {
        //         user.otp = otp;
        //         user.otpExpire = otpExpire;
        //         await user.save();
        //     } else {
        //         const lastUser = await User.findOne().sort({ user_id: -1 });
        //         let newUserId = 1;
        //         if (lastUser && lastUser.user_id && !isNaN(lastUser.user_id)) {
        //             newUserId = parseInt(lastUser.user_id) + 1;
        //         }
        //         const extractedName = email?.split('@')[0] || `user${newUserId}`;

        //         user = await User.create({
        //             user_id: newUserId,
        //             name: extractedName,
        //             slug: newUserId,
        //             username: newUserId,
        //             email: email || '',
        //             phone,
        //             firebase_auth_uid: uid,
        //             otp,
        //             otpExpire,
        //             role: 'user',
        //             theme: 'default',
        //             theme_color: '#16163F',
        //             is_password_set: 0,
        //             password: "25f9e794323b453885f5181f1b624d0b",
        //             join_date: new Date(),
        //             last_login: new Date(),
        //             status: 1,
        //             vstatus: 1
        //         });
        //     }

        //     await sendOtp(phone, otp); // Send OTP
        // }

        // // 🌍 FACEBOOK AUTH
        // else if (email && name && image_url) {
        //     user = await User.findOne({ email });
        //     if (!user) {
        //         const lastUser = await User.findOne().sort({ user_id: -1 });
        //         let newUserId = 1;
        //         if (lastUser && lastUser.user_id && !isNaN(lastUser.user_id)) {
        //             newUserId = parseInt(lastUser.user_id) + 1;
        //         }

        //         user = await User.create({
        //             user_id: newUserId,
        //             name,
        //             slug: newUserId,
        //             username: newUserId,
        //             email,
        //             firebase_auth_uid: uid,
        //             profile_picture: image_url,
        //             role: 'user',
        //             theme: 'default',
        //             theme_color: '#16163F',
        //             is_password_set: 0,
        //             password: "buildVersion ",
        //             join_date: new Date(),
        //             last_login: new Date(),
        //             status: 1,
        //             vstatus: 1
        //         });
        //     }
        // }

        if (!user) {
            return res.status(400).json({ message: "Invalid request parameters" });
        }

        return res.status(200).json({
                success: true,
                message: "Firebase authentication successful",
                user_id: user._id,        // ✅ MongoDB _id as user_id
                firebase_uid: uid,        // ✅ Firebase UID for reference
                name: user.name,
                email: user.email,
                phone: user.phone,
                username: user.username,
                role: user.role,
                theme: user.theme,
                theme_color: user.theme_color,
                join_date: user.join_date,
                gender: user.gender || "male",
                data: "stuein",
                profile_picture: user.profile_picture,
                image_url: user.profile_picture || image_url,
                password_available: user.is_password_set === 1,
                last_login: user.last_login,
                status: user.status,
                country: country,
                deviceid: user.deviceid,
                fcm: user.fcm,
                versioncode: user.versioncode
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
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
