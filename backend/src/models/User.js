const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    // Add profile information (optional)
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
}, {
    tableName: 'users',
    timestamps: true,
    
    // --- Sequelize Hooks for Password Hashing ---
    hooks: {
        // Hash the password before the user record is created or updated
        beforeCreate: async (user) => {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
    },
});

// --- Instance Method for Password Comparison ---
User.prototype.comparePassword = function(candidatePassword) {
    // 'this.password' refers to the hashed password stored in the database
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;