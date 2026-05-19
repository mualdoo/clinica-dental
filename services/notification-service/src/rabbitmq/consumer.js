import { connect } from 'amqplib'
import { setupConsumer } from '@mualdoo/shared'
import {
    sendAccountVerificationEmail,
    sendAppointmentConfirmationEmail,
} from '../services/email-service.js'

export default async function startConsumers() {
    try {
        const conn = await connect(process.env.RABBITMQ_URL)
        const channel = await conn.createChannel()

        channel.prefetch(1)

        // Consumer after creating a patient account (by system)
        await setupConsumer(
            channel,
            'patient_account_created_exchange',
            'patient_account_email',
            async (data) => {
                return await sendAccountVerificationEmail(data)
            }
        )

        // Consumer after creating an appointment
        await setupConsumer(
            channel,
            'appointment_created_exchange',
            'appointment_created_queue',
            async (data) => {
                return await sendAppointmentConfirmationEmail(data)
            }
        )

        console.log('notification-service listening messages')
    } catch (error) {
        console.error('Error connecting to rabbitMQ:', error.message)
        setTimeout(startConsumers, 5000)
    }
}
