const { Model, DataTypes } =require('sequelize');
const sequelize = require('../config/database');
const { encryptInstance, decryptInstance } = require('../services/encryption-service');

class PatientFile extends Model {}

PatientFile.init(
    {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        type: {
            type: DataTypes.ENUM('x-ray', 'before_photo', 'after_photo', 'document', 'other'),
            defaultValue: 'other'
        },
        fileName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        storageKey: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        mimeType: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        sizeBytes: {
            type: DataTypes.INTEGER,
            allowNull: false
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

module.exports = PatientFile;