import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import { encryptInstance, decryptInstance } from '../services/encryption-service.js';

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

export default Tooth;