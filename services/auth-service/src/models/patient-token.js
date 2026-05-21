import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
import { randomBytes } from 'crypto'

class ActivationToken extends Model {
    isTokenValid(token) {
        if (this.activationToken !== token) {
            return false
        }

        const now = new Date(Date.now)
        const expireTime = new Date(this.expiresAt)
        if (now > expireTime) {
            return false
        }
        return true
    }
}

const generateToken = (activationToken) => {
    const token = randomBytes(32).toString('hex')

    const dayInMilliseconds = 24 * 60 * 60 * 1000
    const expiresAt = new Date(Date.now() + dayInMilliseconds)

    activationToken.activationToken = token
    activationToken.expiresAt = expiresAt
}

ActivationToken.init(
    {
        activationToken: {
            type: DataTypes.STRING,
            validate: {
                isNull: true,
            },
        },
        expiresAt: {
            type: DataTypes.DATE,
            validate: {
                isNull: true,
            },
        },
    },
    {
        sequelize,
        timestamps: false,
        hooks: {
            beforeSave: generateToken,
        },
    }
)

export default ActivationToken
