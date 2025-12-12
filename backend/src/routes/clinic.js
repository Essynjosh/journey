const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const Clinic = require('../models/Clinic'); // Import the Clinic Model

/**
 * @route GET /api/clinics
 * @desc Retrieves a list of clinics based on filters (county, service, priceBand).
 * @access Public
 * @queryParam county (string), service (string), priceBand (FREE|LOW|MEDIUM|HIGH)
 */
router.get('/', async (req, res) => {
    const { county, service, priceBand } = req.query;
    const whereClause = {};

    // 1. Build the Dynamic WHERE Clause

    // Filter by County
    if (county) {
        whereClause.county = county; // Exact match for county name
    }

    // Filter by Service (Uses LIKE for partial text match on the comma-separated string)
    // This is less robust than a separate Services table, but easier for MVP
    if (service) {
        whereClause.availableServices = {
            [Op.like]: `%${service}%` // Finds the service name within the string
        };
    }

    // Filter by Price Band
    if (priceBand) {
        // Ensure the price band matches one of the defined ENUM values
        if (['FREE', 'LOW', 'MEDIUM', 'HIGH'].includes(priceBand.toUpperCase())) {
            whereClause.priceBand = priceBand.toUpperCase();
        }
    }

    try {
        // 2. Execute the Query
        const clinics = await Clinic.findAll({
            where: whereClause,
            attributes: ['id', 'name', 'county', 'availableServices', 'priceBand', 'contactPhone', 'locationCoords', 'isNHIFAccredited'],
            order: [['priceBand', 'ASC']], // Order by affordability
        });

        // 3. Send Response
        return res.status(200).json({
            count: clinics.length,
            clinics: clinics,
        });

    } catch (error) {
        console.error('Error retrieving clinic data:', error);
        res.status(500).json({ message: 'Internal server error while retrieving clinics.' });
    }
});

module.exports = router;