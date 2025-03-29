const userSchema = require('../../models/user.model');
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
        console.error('Login Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
