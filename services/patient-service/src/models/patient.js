import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Patient extends Model {
    getFullName() {
        return [this.name, this.lastName].join(' ');
    }
}

Patient.init(
    {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        birthDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        gender: {
            type: DataTypes.ENUM('M', 'F', 'O'),
            defaultValue: 'O'
        },
        phone: DataTypes.STRING,
        address: DataTypes.STRING,
        bloodType: DataTypes.STRING(5)
    },
    {
        sequelize,
        paranoid: true
    }
);

export default Patient;