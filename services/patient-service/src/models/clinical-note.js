import { Model, DataTypes} from 'sequelize';
import sequelize from '../config/database.js';
import { encryptInstance, decryptInstance } from '../services/encryption-service.js';

class ClinicalNote extends Model {}

ClinicalNote.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        // appointmentId: {
        //     type: DataTypes.UUID,
        //     allowNull: false
        // },
        subjective: {
            type: DataTypes.TEXT,
            encrypt: true
        },
        objective: {
            type: DataTypes.TEXT,
            encrypt: true
        },
        assessment: {
            type: DataTypes.TEXT,
            encrypt: true
        },
        plan: {
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

export default ClinicalNote;