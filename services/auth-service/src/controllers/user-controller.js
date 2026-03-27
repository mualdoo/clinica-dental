const { User, PatientToken } = require('../models');
const generateToken = require('../services/token-service');
const { ok, fail, catchAsync } = require('@mualdoo/shared');

exports.verifyPatientAccount = catchAsync(async (req, res) => {
    const { token, email, password } = req.body;
    const user = await User.findOne({ where: { email }, include: PatientToken });

    if (!user) return fail(res, 'User not found');
    if (!user.PatientToken.isTokenValid(token)) return fail(res, 'Invalid or expired token');

    await user.update({ password });
    await user.PatientToken.destroy();

    return ok(res, 'Account verified');
});

exports.register = catchAsync(async (req, res) => {
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

exports.login = catchAsync(async (req, res) => {
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