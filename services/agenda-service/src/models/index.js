import sequelize from '../config/database.js';
import Cubicle from './cubicle.js';
import Appointment from './appointment.js';

Cubicle.hasMany(Appointment, { foreignKey: { name: 'cubicleId', allowNull: false } });
Appointment.belongsTo(Cubicle, { foreignKey: { name: 'cubicleId', allowNull: false } });

const syncDatabase = async () => {
    await sequelize.sync({ alter: true });
};

export { sequelize, syncDatabase, Cubicle, Appointment };