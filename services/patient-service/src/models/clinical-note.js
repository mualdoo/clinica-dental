const sequelize = require('../config/database');

const { Model, DataTypes } = require('sequelize');
const { encryptInstance, decryptInstance } = require('../services/encryption-service');

class ClinicalNote extends Model {}

ClinicalNote.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        addedBy: {
            type: DataTypes.UUID,
            allowNull: false
        },
        // appointmentId: {
        //     type: DataTypes.UUID,
        //     allowNull: false
        // },
        diagnosis: {
            type: DataTypes.TEXT,
            encrypt: true
        },
        plan: {
            type: DataTypes.TEXT,
            encrypt: true
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

module.exports = ClinicalNote;