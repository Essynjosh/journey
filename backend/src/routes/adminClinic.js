const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminAuth'); // <--- NEW IMPORT
const Clinic = require('../models/Clinic');
const { Op } = require('sequelize'); // For validation/query checks

// Apply both protection middleware globally to all routes in this router
router.use(protect, checkAdmin); 

// --- C: Create New Clinic ---
/**
 * @route POST /api/admin/clinics
 * @desc Adds a new clinic to the database.
 */
router.post('/', async (req, res) => {
    try {
        const newClinic = await Clinic.create(req.body);
        res.status(201).json({ 
            message: 'Clinic successfully added.', 
            clinic: newClinic 
        });
    } catch (error) {
        console.error('Error adding clinic:', error);
        res.status(400).json({ message: 'Error adding clinic. Check data validity.', details: error.message });
    }
});

// --- R: Read All Clinics (Admin View) ---
/**
 * @route GET /api/admin/clinics
 * @desc Retrieves all clinics (often used for management tables).
 */
router.get('/', async (req, res) => {
    try {
        const clinics = await Clinic.findAll({
            order: [['county', 'ASC'], ['name', 'ASC']],
        });
        res.status(200).json({ count: clinics.length, clinics });
    } catch (error) {
        console.error('Error retrieving all clinics:', error);
        res.status(500).json({ message: 'Server error retrieving clinic list.' });
    }
});

// --- U: Update Existing Clinic ---
/**
 * @route PUT /api/admin/clinics/:id
 * @desc Updates a specific clinic's data.
 */
router.put('/:id', async (req, res) => {
    const clinicId = req.params.id;
    try {
        const [updatedRows] = await Clinic.update(req.body, {
            where: { id: clinicId }
        });

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Clinic not found.' });
        }

        const updatedClinic = await Clinic.findByPk(clinicId);
        res.status(200).json({ 
            message: 'Clinic successfully updated.', 
            clinic: updatedClinic 
        });
    } catch (error) {
        console.error(`Error updating clinic ${clinicId}:`, error);
        res.status(400).json({ message: 'Error updating clinic. Check data validity.' });
    }
});

// --- D: Delete Clinic ---
/**
 * @route DELETE /api/admin/clinics/:id
 * @desc Deletes a specific clinic entry.
 */
router.delete('/:id', async (req, res) => {
    const clinicId = req.params.id;
    try {
        const deletedRows = await Clinic.destroy({
            where: { id: clinicId }
        });

        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Clinic not found.' });
        }

        res.status(200).json({ message: 'Clinic successfully deleted.' });
    } catch (error) {
        console.error(`Error deleting clinic ${clinicId}:`, error);
        res.status(500).json({ message: 'Server error during deletion.' });
    }
});

module.exports = router;