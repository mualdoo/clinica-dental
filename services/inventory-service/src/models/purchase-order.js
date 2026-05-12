import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

class PurchaseOrder extends Model {}

PurchaseOrder.init(
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
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
            },
        },
        status: {
            type: DataTypes.ENUM(
                'draft',
                'sent',
                'confirmed',
                'received',
                'cancelled'
            ),
            defaultValue: 'draft',
        },
        totalAmount: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        performedBy: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        sequelize,
        hooks: {
            beforeUpdate: (newInstance) => {
                if (newInstance.changed('status')) {
                    if (newInstance.previous('status') !== 'received') return
                }
                throw new Error('Orders cannot be changed')
            },
            beforeDestroy: () => {
                throw new Error('Orders cannot be removed')
            },
        },
    }
)

export default PurchaseOrder
