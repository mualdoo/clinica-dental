import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Payment extends Model {}

Payment.init(
    {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        amount: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false
        },
        method: {
            type: DataTypes.ENUM('cash', 'card_credit', 'card_debit', 'transfer', 'check'),
            allowNull: false
        },
        reference: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'voided', 'refunded'),
            allowNull: false
        }
    },
    {
        sequelize,
        hooks: {
            beforeUpdate: () => {
                throw new Error('Payments cannot be changed');
            },
            beforeDestroy: () => {
                throw new Error('Payments cannot be changed');
            },
        },
        validate: {
            isReferenceValid() {
                if (this.method !== 'cash' && !this.reference) {
                    throw new Error('Reference cannot be empty');
                }
            }
        }
    }
);

export default Payment;