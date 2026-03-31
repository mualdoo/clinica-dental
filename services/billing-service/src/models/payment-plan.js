import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class PaymentPlan extends Model {
    isOverdue() {
        const today = new Date();
        return today > new Date(this.validUntil);
    }
}

PaymentPlan.init(
    {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        validUntil: {
            type: DataTypes.DATE,
            allowNull: false
        },
        isPaid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    { sequelize }
);

export default PaymentPlan;