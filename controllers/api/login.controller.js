const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const STATIC_USER = {
    id: 1,
    email: 'admin@gmail.com',
    password: crypto.createHash('md5').update('123456').digest('hex') // MD5 hash of '123456'
};

// Login function
exports.login = (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(STATIC_USER.password);
        // Validate request body
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if email matches
        if (email !== STATIC_USER.email) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Hash the input password and compare with stored hash
        const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
        if (hashedPassword !== STATIC_USER.password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: STATIC_USER.id, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });

    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
