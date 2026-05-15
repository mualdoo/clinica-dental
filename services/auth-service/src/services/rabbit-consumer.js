import { connect } from 'amqplib'
import { setupConsumer } from '@mualdoo/shared'
import createPatientAccount from './patient-account-service.js'

export default async function startConsumers() {
    try {
        const conn = await connect(process.env.RABBITMQ_URL)
        const channel = await conn.createChannel()

        channel.prefetch(1)

        // Consumer after creating a patient
        await setupConsumer(
            channel,
            'patient_created_exchange',
            'patient_account_queue',
            async (data) => {
                return await createPatientAccount(data)
            }
        )

        console.log('patient-account-service listening messages')
    } catch (error) {
        console.error('Error connecting to rabbitMQ:', error.message)
        setTimeout(startConsumers, 5000)
    }
}
