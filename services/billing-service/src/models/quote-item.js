import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class QuoteItem extends Model {}

QuoteItem.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        toothNumber: {
            type: DataTypes.SMALLINT,
            allowNull: true
        },
        discount: {
            type: DataTypes.FLOAT,
            validate: { min: 0, max: 1 }
        }
    },
    { sequelize }
);

export default QuoteItem;