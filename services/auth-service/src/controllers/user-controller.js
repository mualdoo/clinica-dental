const { User, PatientToken } = require('../models');
const generateToken = require('../services/token-service');
const { ok, fail, publishEvent } = require('@aldop-11/shared');

exports.createPatientAccount = async (req, res) => {
    try {
        const { email, name, lastName } = req.body;
        const user = await User.create({
            email,
            name,
            lastName,
            role: 'patient'
        });

        const patientToken = await PatientToken.create({ patientId: user.id });

        // Publish event to notifications-service
        await publishEvent(
            'appointment_created_exchange',
            process.env.RABBITMQ_URL,
            {
                email: user.email,
                fullName: user.getFullName(),
                token: patientToken.activationToken
            }
        )

        return ok(res, 'Patient created')
    } catch (error) {
        return fail(res, error, 500);
    }
};

exports.verifyPatientAccount = async (req, res) => {
    try {
        const { token, email, password } = req.body;
        const user = await User.findOne({ where: { email }, include: PatientToken });

        if (!user) return fail(res, 'User not found');
        if (!user.PatientToken.isTokenValid(token)) return fail(res, 'Invalid or expired token');

        await user.update({ password });
        await user.PatientToken.destroy();

        return ok(res, 'Account verified');
    } catch (error) {
        return fail(res, error, error.statusCode || 400);
    }
};

exports.register = async (req, res) => {
    try {
        const user = await User.create(req.body);

        const token = generateToken(user);
        const responseData = {
            token,
            user: {
                email: user.email,
                role: user.role
            }
        };

        return ok(res, responseData, 201);
    } catch (error) {
        return fail(res, error, error.statusCode || 400);
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) return fail(res, 'Invallid login');
        if (!user.isVerified()) return fail(res, 'User email is not verified');
        const rightPassword = await user.verifyPassword(password);
        if (!rightPassword) return fail(res, 'Invallid login');

        const token = generateToken(user);
        const responseData = {
            token,
            user: {
                email: user.email,
                role: user.role
            }
        };

        return ok(res, responseData, 201);
    } catch (error) {
        return fail(res, error, error.statusCode || 400);
    }
};