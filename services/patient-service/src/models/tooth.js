const sequelize = require('../config/database');

const { Model, DataTypes } = require('sequelize');
const { encryptInstance, decryptInstance } = require('../services/encryption-service');

class Tooth extends Model {}

Tooth.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        number: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        surface: {
            type: DataTypes.ENUM('mesial', 'distal', 'vestibular', 'lingual', 'oclusal'),
            allowNull: false
        },
        condition: {
            type: DataTypes.TEXT,
            encrypt: true
        },
        notes: {
            type: DataTypes.TEXT,
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

module.exports = Tooth;