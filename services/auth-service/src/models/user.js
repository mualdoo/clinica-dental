import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
import { compare, hash } from 'bcrypt'

class User extends Model {
    getFullName() {
        return [this.name, this.lastName].join(' ')
    }
    isVerified() {
        return this.password != null
    }
    async verifyPassword(text) {
        return await compare(text, this.password)
    }
}

const hashIfChanged = async (user) => {
    if (user.changed('password')) {
        const passwordHashed = await hash(user.password, 12)
        console.log(passwordHashed)

        user.password = passwordHashed
    }
}

User.init(
    {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('dentist', 'admin', 'patient', 'receptionist'),
            defaultValue: 'patient',
        },
    },
    {
        sequelize,
        paranoid: true,
        hooks: {
            beforeSave: hashIfChanged,
        },
        validate: {
            isPasswordValid() {
                if (!this.password && this.role != 'patient') {
                    throw new Error('Password is required')
                }
            },
        },
    }
)

export default User
