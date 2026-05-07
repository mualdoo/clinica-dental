import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

class QuoteItem extends Model {}

QuoteItem.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        treatmentId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: false,
        },
        quoteId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: false,
        },
        toothNumber: {
            type: DataTypes.SMALLINT,
            allowNull: true,
        },
        discount: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            validate: { min: 0, max: 1 },
        },
    },
    {
        sequelize,
        hooks: {
            beforeUpdate: (newItem) => {
                if (newItem.changed('quoteId'))
                    throw new Error('Quote cannot be changed')
            },
        },
    }
)

export default QuoteItem
