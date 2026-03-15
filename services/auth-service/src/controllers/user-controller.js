const { User, PendingPatient } = require('../models');
const generateToken = require('../services/token-service');

exports.createPatientAccount = async (req, res) => {
    try {
        const { email, name, lastName } = req.body;
        const user = await User.create({
            email,
            name,
            lastName,
            role: 'patient'
        });
        if (!user) {
            return res.status(400).json({ message: 'Error adding user' });
        }

        const pendingPatient = await PendingPatient.create({ patientId: user.id });

        // Publish event to notifications-service

        res.status(201).json(user);
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                errors: error.errors.map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.addUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        if (!user) {
            return res.status(400).json({ message: 'Error adding user' });
        }

        res.status(201).json(user);
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                errors: error.errors.map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.verifyPatientAccount = async (req, res) => {
    try {
        const { token, email, password } = req.body;
        const user = await User.findOne({ where: { email }, include: PendingPatient });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        
        if (!user.PendingPatient.isTokenValid(token)) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        await user.update({ password });
        await user.PendingPatient.destroy();

        res.status(201).json({ message: 'Account verified' });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                errors: error.errors.map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.register = async (req, res) => {
    try {
        const user = await User.create(req.body);
        
        if (!user) {
            return res.status(400).json({ message: 'Error adding user' });
        }

        const token = generateToken(user);

        res.status(201).json({
            token,
            user: {
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                errors: error.errors.map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: 'Invalid login' });
        }
        if (!user.isVerified) {
            return res.status(400).json({ message: 'User email not verified' });
        }
        if (!user.verifyPassword(password)) {
            return res.status(400).json({ message: 'Invalid login' });
        }

        const token = generateToken(user);

        res.status(201).json({
            token,
            user: {
                email,
                role: user.role
            }
        });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                errors: error.errors.map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};