import amqp from 'amqplib'
import { User, ActivationToken } from '../models/index.js'
import { publishEvent } from '@mualdoo/shared'

const createPatientAccount = async (data) => {
    const { id, email, name, lastName, role } = data
    const user = await User.create({
        id,
        email,
        name,
        lastName,
        role,
    })

    const activationToken = await ActivationToken.create({ userId: user.id })

    await publishEvent(
        amqp,
        'user_account_created_exchange',
        process.env.RABBITMQ_URL,
        {
            email: user.email,
            fullName: user.getFullName(),
            token: activationToken.activationToken,
            role,
        }
    )
}

export default createPatientAccount
