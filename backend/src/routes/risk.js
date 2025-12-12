const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // <--- CRITICAL: Import protect middleware
const { evaluateRisk } = require('../utils/riskEngine');
const RiskCheck = require('../models/RiskCheck'); // Import the Sequelize Model

/**
 * @route POST /api/risk-check
 * @desc Accepts symptom data, calculates risk score, and stores the session details.
 * @access Public (No protection needed, but authentication is used if present)
 */
router.post('/', protect, async (req, res) => { // <--- ADDED 'protect' to make userId available
    
    // We attempt to get the userId from the JWT. If the token is missing/invalid,
    // the 'protect' middleware would normally block it (401). 
    // HOWEVER, for a Risk Check, we want to allow unauthenticated checks, so we adjust the logic.
    // OPTIMIZED LOGIC:
    const userId = req.userId || null; // Use authenticated ID or null if guest
    
    const answers = req.body; 

    if (!answers || !answers.q_age || !answers.q_sex) {
        return res.status(400).json({ message: 'Missing required inputs (age and sex).' });
    }

    try {
        // 1. Evaluate Risk using the Rule-Based Engine
        const evaluation = evaluateRisk(answers);
        const { riskLevel, score, recommendations } = evaluation;

        // 2. Database Operation: Store the ENTIRE Session
        const newRiskCheck = await RiskCheck.create({
            userId: userId, // <--- NOW USES AUTHENTICATED OR NULL ID
            answers: answers, 
            riskLevel: riskLevel,
            score: score,
            recommendation: recommendations, // Changed to match field name in evaluation
        });
        
        console.log(`Risk Check session recorded with ID: ${newRiskCheck.id} for User: ${userId || 'Guest'}`);

        // 3. Send Response
        return res.status(201).json({
            riskLevel: riskLevel,
            score: score,
            recommendation: recommendations,
            checkId: newRiskCheck.id,
            message: 'Risk assessment complete and session saved.',
        });

    } catch (error) {
        console.error('Error during risk evaluation and session save:', error);
        res.status(500).json({ message: 'Internal server error while processing and saving session.' });
    }
});


/**
 * @route GET /api/risk-check/progress
 * @desc Retrieves all past risk assessment sessions for progress tracking.
 * @access Private (REQUIRES TOKEN)
 */
// NOTE: This route MUST use the 'protect' middleware to ensure security
router.get('/progress', protect, async (req, res) => { 
    // The userId is securely retrieved from the JWT token by the 'protect' middleware.
    const userId = req.userId; // <--- NO MORE HARDCODED ID!

    try {
        const history = await RiskCheck.findAll({
            where: { userId: userId }, // <--- Filtered by authenticated user
            order: [['createdAt', 'DESC']], 
            attributes: ['id', 'riskLevel', 'score', 'createdAt'], 
        });

        if (history.length === 0) {
            // Use 200 with empty array rather than 404 for a successful check that returns nothing
            return res.status(200).json({ progress: [], message: 'No past risk sessions found for this user.' });
        }

        const progressData = history.map(session => ({
            id: session.id, // Include the ID for linking to SessionDetails page
            date: session.createdAt,
            risk: session.riskLevel,
            score: session.score,
        }));

        return res.status(200).json({ progress: progressData });

    } catch (error) {
        console.error('Error retrieving risk history:', error);
        res.status(500).json({ message: 'Internal server error retrieving history.' });
    }
});

module.exports = router;