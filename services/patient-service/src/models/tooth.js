const sequelize = require('../config/database');

const { Model, DataTypes } = require('sequelize');
const { encrypt, decrypt } = require('../services/encryption-service');

const encryptInstance = (tooth) => {
    const attributes = tooth.constructor.rawAttributes;
    
    for (const key in attributes) {
        if (attributes[key].encrypt && tooth.changed(key)) {
            const value = tooth.getDataValue(key);
            tooth.setDataValue(key, encrypt(value))
        }
    }
}

const decryptInstance = (result) => {
    if (!result) return;
    
    const teeth = Array.isArray(result) ? result : [result];
    
    const attributes = teeth[0].constructor.rawAttributes;
    
    teeth.forEach(tooth => {
        for (const key in attributes) {
            if (attributes[key].encrypt && tooth[key]) {
                tooth[key] = decrypt(tooth[key]);
            }
        }
    });
};

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