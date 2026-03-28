const sequelize = require('../config/database');
const Cubicle = require('./cubicle');
const Appointment = require('./appointment');

Cubicle.hasMany(Appointment, { foreignKey: { name: 'cubicleId', allowNull: false } });
Appointment.belongsTo(Cubicle, { foreignKey: { name: 'cubicleId', allowNull: false } });

const syncDatabase = async () => {
    await sequelize.sync({ alter: true });
};

module.exports = { sequelize, syncDatabase, Cubicle, Appointment };