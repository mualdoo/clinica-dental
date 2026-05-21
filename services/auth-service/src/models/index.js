import sequelize from '../config/database.js'
import User from './user.js'
import ActivationToken from './patient-token.js'

User.hasOne(ActivationToken, {
    foreignKey: { name: 'userId', allowNull: false },
})
ActivationToken.belongsTo(User, {
    foreignKey: { name: 'userId', allowNull: false },
})

const syncDatabase = async () => {
    await sequelize.sync({ alter: true })
}

export { sequelize, syncDatabase, User, ActivationToken }
