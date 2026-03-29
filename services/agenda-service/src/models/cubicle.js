import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Cubicle extends Model {}

Cubicle.init(
    {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    { sequelize }
);

export default Cubicle;