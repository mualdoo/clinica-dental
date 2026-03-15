const { Model, DataTypes } =require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto');

class PatientToken extends Model {
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

const generateToken = (patientToken) => {
    const token = crypto.randomBytes(32).toString('hex');
    
    const dayInMilliseconds = 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + dayInMilliseconds);

    patientToken.activationToken = token;
    patientToken.expiresAt = expiresAt;
};

PatientToken.init(
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

module.exports = PatientToken;