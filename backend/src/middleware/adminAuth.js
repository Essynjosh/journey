const User = require('../models/User'); // Import the User model

// CRITICAL: Replace these IDs with actual IDs of admin users once they are registered.
// In a real application, this would check a 'role' column (e.g., 'role: "admin"') in the database.
const ADMIN_USER_IDS = [1, 2]; 

/**
 * Middleware to check if the authenticated user is an administrator.
 */
const checkAdmin = async (req, res, next) => {
    const userId = req.userId; // Provided by the 'protect' middleware

    if (!userId) {
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }

    try {
        // Simple check based on hardcoded IDs (MVP)
        const isAdmin = ADMIN_USER_IDS.includes(userId);
        
        // Advanced check (Future):
        // const user = await User.findByPk(userId, { attributes: ['role'] });
        // const isAdmin = user && user.role === 'admin';

        if (isAdmin) {
            next(); // User is authorized, proceed to the route handler
        } else {
            res.status(403).json({ message: 'Forbidden: You do not have administrator privileges.' });
        }
    } catch (error) {
        console.error('Admin check failed:', error);
        res.status(500).json({ message: 'Internal server error during authorization check.' });
    }
};

module.exports = { checkAdmin };