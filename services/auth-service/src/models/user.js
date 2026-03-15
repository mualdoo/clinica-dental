const { Model, DataTypes } =require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

class User extends Model {
    getFullName() {
        return [this.name, this.lastName].join(' ');
    }
    isVerified() {
        return this.password != null;
    }
    verifyPassword(text) {
        return bcrypt.compare(text, this.password);
    }
}

const hashIfChanged = async (user) => {
    if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
    }
};

User.init(
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
        password: {
            type: DataTypes.STRING,
            allowNull: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('dentist', 'admin', 'patient'),
            defaultValue: 'patient'
        }
    },
    {
        sequelize,
        paranoid: true,
        hooks: {
            beforeSave: hashIfChanged,
            beforeUpdate: hashIfChanged
        },
        validate: {
            isPasswordValid() {
                if (!this.password && this.role != 'patient') {
                    throw new Error('Password is required');
                }
            }
        }
    }
);

module.exports = User;