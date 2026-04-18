import sequelize from '../config/database.js'
import User from './user.js'
import PatientToken from './patient-token.js'

User.hasOne(PatientToken, {
    foreignKey: { name: 'patientId', allowNull: false },
})
PatientToken.belongsTo(User, {
    foreignKey: { name: 'patientId', allowNull: false },
})

const syncDatabase = async () => {
    await sequelize.sync({ alter: true })
}

export { sequelize, syncDatabase, User, PatientToken }
