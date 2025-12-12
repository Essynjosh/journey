const express = require('express');

// --- 1. Load Configuration and Database Connector ---
const { connectDB, sequelize } = require('./src/config/database'); // Correct path: ./src/config/database

// --- 2. Load Models (CRITICAL: Must load before sequelize.sync() is called) ---
// By requiring them here, they execute and register themselves with the sequelize instance.
require('./src/models/RiskCheck'); 
require('./src/models/Clinic'); 
require('./src/models/User');


// --- 3. Load Routes ---
const riskRoutes = require('./src/routes/risk');       // Correct path: ./src/routes/risk
const clinicRoutes = require('./src/routes/clinic'); 
const authRoutes = require('./src/routes/auth'); 
const adminClinicRoutes = require('./src/routes/adminClinic'); // Correct path: ./src/routes/clinic

// --- 4. Initialize Express App ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.json()); // Allows parsing of JSON request bodies

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/risk-check', riskRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/admin/clinics', adminClinicRoutes);

// Health Check Route
app.get('/', (req, res) => {
    // Check if Sequelize connection is ready (simple check)
    const dbStatus = sequelize ? 'Connected' : 'Not Ready';
    res.send({ 
        message: 'Smart Health API is running.',
        database: dbStatus 
    });
});

// --- 5. Start Server Function ---
const startServer = async () => {
    console.log('Attempting to connect to database and start server...');
    try {
        await connectDB(); // Connects to MySQL and syncs models/tables
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Fatal error starting server:', error.message);
        process.exit(1);
    }
};

startServer();