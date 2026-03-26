const { User, PatientToken } = require('../models');
const generateToken = require('../services/token-service');
const { ok, fail, publishEvent, catchAsync } = require('@mualdoo/shared');
const amqp = require('amqplib');

exports.createPatientAccount = catchAsync (async (req, res) => {
    const { email, name, lastName } = req.body;
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

    return ok(res, 'Patient created');
});

exports.verifyPatientAccount = catchAsync (async (req, res) => {
    const { token, email, password } = req.body;
    const user = await User.findOne({ where: { email }, include: PatientToken });

    if (!user) return fail(res, 'User not found');
    if (!user.PatientToken.isTokenValid(token)) return fail(res, 'Invalid or expired token');

    await user.update({ password });
    await user.PatientToken.destroy();

    return ok(res, 'Account verified');
});

exports.register = catchAsync (async (req, res) => {
    const user = await User.create(req.body);

    const token = generateToken(user);
    const dataResponse = {
        token,
        user: {
            email: user.email,
            role: user.role
        }
    };
    return ok(res, dataResponse, 201);
});

exports.login = catchAsync (async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) return fail(res, 'Invallid login');
    if (!user.isVerified()) return fail(res, 'User email is not verified');
    const rightPassword = await user.verifyPassword(password);
    if (!rightPassword) return fail(res, 'Invallid login');

    const token = generateToken(user);
    const dataResponse = {
        token,
        user: {
            email: user.email,
            role: user.role
        }
    };

    return ok(res, dataResponse, 201);
});