import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

class Quote extends Model {
    isActive() {
        return this.status !== 'draft'
    }
    isOverdue() {
        const today = new Date()
        return today > new Date(this.validUntil)
    }
    isAmountValid(amount) {
        return this.total - amount >= 0
    }
}

Quote.init(
    {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        patientId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        notes: {
            type: DataTypes.STRING,
        },
        total: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0,
        },
        status: {
            type: DataTypes.ENUM(
                'draft',
                'sent',
                'accepted',
                'rejected',
                'expired',
                'paid'
            ),
            defaultValue: 'draft',
        },
        validUntil: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        hooks: {
            beforeUpdate: (quoteInstance) => {
                if (quoteInstance.isActive())
                    throw new Error('Active quotes cannot be changed')
            },
            beforeDestroy: (quoteInstance) => {
                if (quoteInstance.isActive())
                    throw new Error('Active quotes cannot be changed')
            },
        },
    }
)

export default Quote
