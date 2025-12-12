// backend/src/models/RiskCheck.js

const { DataTypes } = require('sequelize');

// CRITICAL LINE: Must use destructuring {}
const { sequelize } = require('../config/database'); 

const RiskCheck = sequelize.define('RiskCheck', {
    // ... rest of the model ...
});

module.exports = RiskCheck;