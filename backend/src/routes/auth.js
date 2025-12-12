const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Set a secret key for JWT (CRITICAL: Use an environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'a_very_strong_default_secret_key'; 
const TOKEN_EXPIRY = '1h'; // Token expires in 1 hour

// --- Helper function to generate JWT ---
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 */
router.post('/register', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // 1. Check if user already exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        }

        // 2. Create the user (password hashing is handled by the model hook)
        user = await User.create({ email, password, firstName, lastName });

        // 3. Generate token
        const token = generateToken(user.id);

        res.status(201).json({ 
            token, 
            message: 'Registration successful.',
            userId: user.id
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & get token
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // 1. Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 2. Compare password (using the instance method we created)
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 3. Generate token
        const token = generateToken(user.id);

        res.status(200).json({ 
            token, 
            message: 'Login successful.',
            userId: user.id 
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router;