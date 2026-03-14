const sequelize = require('../config/database');
const User = require('./user');

const syncDatabase = async () => {
    await sequelize.sync({ alter: true });
};

module.exports = { sequelize, syncDatabase, User };