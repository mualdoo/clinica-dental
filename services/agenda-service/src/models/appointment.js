const { Model, DataTypes } =require('sequelize');
const sequelize = require('../config/database');

class Appointment extends Model {
    isConfirmed() {
        return this.reminderSentAt !== null;
    }
}

Appointment.init(
    {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        patientId: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        doctorId: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        startTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('scheduled', 'completed', 'missed', 'cancelled'),
            defaultValue: 'scheduled'
        },
        reminderSentAt: {
            type: DataTypes.DATE,
            defaultValue: null
        }
    },
    { sequelize }
);

module.exports = Appointment;