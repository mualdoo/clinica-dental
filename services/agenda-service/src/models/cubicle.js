const { Model, DataTypes } =require('sequelize');
const sequelize = require('../config/database');

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

module.exports = Cubicle;