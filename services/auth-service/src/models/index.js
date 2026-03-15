const sequelize = require('../config/database');
const User = require('./user');
const PatientToken = require('./patient-token');

User.hasOne(PatientToken, {
    foreignKey: {
        name: 'patientId',
        allowNull: false
    }
});
PatientToken.belongsTo(User, {
    foreignKey: {
        name: 'patientId',
        allowNull: false
    }
});

const syncDatabase = async () => {
    await sequelize.sync({ alter: true });
};

module.exports = { sequelize, syncDatabase, User, PatientToken };