import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

class Item extends Model {}

Item.init(
    {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        supplierId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        unit: {
            type: DataTypes.ENUM('caja', 'pieza', 'frasco', 'rollo'),
            allowNull: false,
        },
        unitCost: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        stockCurrent: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        stockMinimum: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expiryDate: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    { sequelize }
)

export default Item
