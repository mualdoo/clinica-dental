import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

class StockMovement extends Model {}

StockMovement.init(
    {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        itemId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('compra', 'consumo', 'ajuste'),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
            },
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        performedBy: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        sequelize,
        hooks: {
            beforeUpdate: () => {
                throw new Error('Orders cannot be changed')
            },
            beforeDestroy: () => {
                throw new Error('Orders cannot be removed')
            },
        },
    }
)

export default StockMovement
