import { Model, DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

class Appointment extends Model {
    isConfirmed() {
        return this.reminderSentAt !== null
    }
}

Appointment.init(
    {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        patientId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        patientName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dentistId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        dentistName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        startTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(
                'scheduled',
                'completed',
                'missed',
                'cancelled',
                'ongoing'
            ),
            defaultValue: 'scheduled',
        },
        reminderSentAt: {
            type: DataTypes.DATE,
            defaultValue: null,
        },
    },
    {
        sequelize,
        validate: {
            isTimeValid() {
                if (this.startTime > this.endTime)
                    throw new Error(
                        'Start time cannot be greater than end time'
                    )
            },
        },
    }
)

export default Appointment
