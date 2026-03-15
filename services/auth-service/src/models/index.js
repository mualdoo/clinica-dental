const sequelize = require('../config/database');
const User = require('./user');
const PendingPatient = require('./pending-patient');

User.hasOne(PendingPatient, {
    foreignKey: {
        name: 'patientId',
        allowNull: false
    }
});
PendingPatient.belongsTo(User, {
    foreignKey: {
        name: 'patientId',
        allowNull: false
    }
});

const syncDatabase = async () => {
    await sequelize.sync({ alter: true });
};

module.exports = { sequelize, syncDatabase, User, PendingPatient };