import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Quote extends Model {}

Quote.init(
    {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        patientId: {
            type: DataTypes.UUID,
            allowNull: false
        },
        notes: {
            type: DataTypes.STRING
        },
        total: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('draft', 'accepted', 'cancelled'),
            defaultValue: false
        }
    },
    { sequelize }
);

export default Quote;