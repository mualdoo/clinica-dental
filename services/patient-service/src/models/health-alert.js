const { Model, DataTypes } =require('sequelize');
const sequelize = require('../config/database');

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
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: false
        }
    },
    {
        sequelize
    }
);

module.exports = HealthAlert;