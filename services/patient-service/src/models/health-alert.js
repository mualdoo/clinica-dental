import { Model, DataTypes} from 'sequelize';
import sequelize from '../config/database.js';
import { encryptInstance, decryptInstance } from '../services/encryption-service.js';

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
            type: DataTypes.TEXT,
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

export default HealthAlert;