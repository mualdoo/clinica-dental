const { User } = require('../models');

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

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        if (!users) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.status(201).json(users);
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                errors: error.errors.map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.update(req.body, { where: { id: req.params.id } });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.destroy({ where: { id: req.params.id } });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};