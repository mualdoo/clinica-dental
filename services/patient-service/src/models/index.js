const sequelize = require('../config/database');
const Patient = require('./patient');
const HealthAlert = require('./health-alert');
const Tooth = require('./tooth');
const ClinicalNote = require('./clinical-note');
const PatientFile = require('./patient-file');

Patient.hasMany(HealthAlert, { foreignKey: { name: 'patientId', allowNull: false } });
HealthAlert.belongsTo(Patient, { foreignKey: { name: 'patientId', allowNull: false } });

Patient.hasMany(Tooth, { foreignKey: { name: 'patientId', allowNull: false } });
Tooth.belongsTo(Patient, { foreignKey: { name: 'patientId', allowNull: false } });

Patient.hasMany(ClinicalNote, { foreignKey: { name: 'patientId', allowNull: false } });
ClinicalNote.belongsTo(Patient, { foreignKey: { name: 'patientId', allowNull: false } });

Patient.hasMany(PatientFile, { foreignKey: { name: 'patientId', allowNull: false } });
PatientFile.belongsTo(Patient, { foreignKey: { name: 'patientId', allowNull: false } });

const syncDatabase = async () => {
    await sequelize.sync({ alter: true });
};

module.exports = { sequelize, syncDatabase, Patient, HealthAlert, Tooth, ClinicalNote, PatientFile };