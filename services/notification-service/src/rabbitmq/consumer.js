import { connect } from 'amqplib'
import { setupConsumer } from '@mualdoo/shared'
import {
    sendAccountVerificationEmail,
    sendAppointmentConfirmationEmail,
    sendPatientFile,
    sendStaffAccountVerificationEmail,
} from '../services/email-service.js'

export default async function startConsumers() {
    try {
        const conn = await connect(process.env.RABBITMQ_URL)
        const channel = await conn.createChannel()

        channel.prefetch(1)

        // Consumer after creating a patient account (by system)
        await setupConsumer(
            channel,
            'user_account_created_exchange',
            'patient_account_email',
            async (data) => {
                if (data.role === 'patient') {
                    return await sendAccountVerificationEmail(data)
                } else {
                    return await sendStaffAccountVerificationEmail(data)
                }
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

        // Consumer for sending a file
        await setupConsumer(
            channel,
            'send_file_to_patient',
            'send_file_to_patient_queue',
            async (data) => {
                return await sendPatientFile(data)
            }
        )

        console.log('notification-service listening messages')
    } catch (error) {
        console.error('Error connecting to rabbitMQ:', error.message)
        setTimeout(startConsumers, 5000)
    }
}
