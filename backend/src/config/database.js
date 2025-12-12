const { Sequelize } = require('sequelize');

// --- 1. Instantiate the Sequelize connection ---
// CRITICAL: This is where the 'sequelize' variable is declared and defined.
const sequelize = new Sequelize(
    'essy', // Database name - CHANGE THIS
    'root',               // Database user - CHANGE THIS
    '1234',// Database password - CHANGE THIS
    {
        host: '127.0.0.1',
        dialect: 'mysql',
        logging: false, 
    }
);

// --- 2. Connection and Sync Function ---
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL connection has been established successfully.');
        await sequelize.sync(); // Creates tables if they don't exist
        console.log('✅ Database synchronized (models synced with DB).');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        // Important: Throw the error so the server start fails cleanly
        throw error; 
    }
};

// --- 3. Export the necessary components ---
// 'sequelize' is now defined and can be exported.
module.exports = { sequelize, connectDB };