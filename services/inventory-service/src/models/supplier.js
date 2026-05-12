import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

class Supplier extends Model {}

Supplier.init(
    {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: DataTypes.STRING,
    },
    { sequelize }
)

export default Supplier
