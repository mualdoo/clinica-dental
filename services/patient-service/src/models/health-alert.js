const { Model, DataTypes } =require('sequelize');
const sequelize = require('../config/database');
const { encryptInstance, decryptInstance } = require('../services/encryption-service');

class HealthAlert extends Model {}

HealthAlert.init(
    {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        type: {
            type: DataTypes.ENUM('allergy', 'condition', 'medication', 'other'),
            defaultValue: 'other'
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
            encrypt: true
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: false
        }
    },
    {
        sequelize,
        hooks: {
            beforeSave: encryptInstance,
            afterFind: decryptInstance
        }
    }
);

module.exports = HealthAlert;