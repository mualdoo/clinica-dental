import sequelize from "../config/database.js";
import Patient from './patient.js';
import HealthAlert from './health-alert.js';
import Tooth from './tooth.js';
import ClinicalNote from './clinical-note.js';
import PatientFile from './patient-file.js';

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

export { sequelize, syncDatabase, Patient, HealthAlert, Tooth, ClinicalNote, PatientFile };