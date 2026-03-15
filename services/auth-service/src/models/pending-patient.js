const { Model, DataTypes } =require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto');

class PendingPatient extends Model {
    isTokenValid(token) {
        if (this.activationToken !== token) {
            return false;
        }

        const now = new Date(Date.now);
        const expireTime = new Date(this.expiresAt);
        if (now > expireTime) {
            return false;
        }
        return true;
    }
}

const generateToken = (pendingPatient) => {
    const token = crypto.randomBytes(32).toString('hex');
    
    const dayInMilliseconds = 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + dayInMilliseconds);

    pendingPatient.activationToken = token;
    pendingPatient.expiresAt = expiresAt;
};

PendingPatient.init(
    {
        activationToken: {
            type: DataTypes.STRING,
            validate: {
                isNull: true
            }
        },
        expiresAt: {
            type: DataTypes.DATE,
            validate: {
                isNull: true
            }
        }
    },
    {
        sequelize,
        timestamps: false,
        hooks: {
            beforeSave: generateToken
        }
    }
);

module.exports = PendingPatient;