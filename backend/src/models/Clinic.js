const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Clinic = sequelize.define('Clinic', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    county: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'e.g., Nairobi, Nakuru, Mombasa'
    },
    locationCoords: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Placeholder for GPS coordinates (lat, long)'
    },
    // Store available services as an array/string list
    availableServices: {
        type: DataTypes.STRING(255), 
        allowNull: false,
        comment: 'Comma-separated list of services (e.g., Pap, Mammogram, PSA)'
    },
    priceBand: {
        type: DataTypes.ENUM('FREE', 'LOW', 'MEDIUM', 'HIGH'),
        allowNull: false,
        comment: 'LOW (0-1K), MEDIUM (1K-5K), HIGH (5K+)'
    },
    contactPhone: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    isNHIFAccredited: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    tableName: 'clinics',
    timestamps: false, // Clinics data doesn't change often
});

module.exports = Clinic;