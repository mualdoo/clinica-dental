const amqp = require('amqplib');
const { User, PatientToken } = require('../models');
const { publishEvent } = require('@mualdoo/shared');

const createPatientAccount = async(data) => {
    const { email, name, lastName } = data;
    const user = await User.create({
        email,
        name,
        lastName,
        role: 'patient'
    });

    const patientToken = await PatientToken.create({ patientId: user.id });

    await publishEvent(
        amqp,
        'appointment_created_exchange',
        process.env.RABBITMQ_URL,
        {
            email: user.email,
            fullName: user.getFullName(),
            token: patientToken.activationToken
        }
    );
};

module.exports = { createPatientAccount };