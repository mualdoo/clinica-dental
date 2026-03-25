const sequelize = require('../config/database');
const Patient = require('./patient');
const HealthAlert = require('./health-alert');
const Tooth = require('./tooth');

Patient.hasMany(HealthAlert, { foreignKey: { name: 'patientId', allowNull: false } });
HealthAlert.belongsTo(Patient, { foreignKey: { name: 'patientId', allowNull: false } });

Patient.hasMany(Tooth, { foreignKey: { name: 'patientId', allowNull: false } });
Tooth.belongsTo(Patient, { foreignKey: { name: 'patientId', allowNull: false } })

const syncDatabase = async () => {
    await sequelize.sync({ alter: true });
};

module.exports = { sequelize, syncDatabase, Patient, HealthAlert, Tooth };