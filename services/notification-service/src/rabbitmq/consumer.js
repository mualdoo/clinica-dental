const amqp = require('amqplib');
const { setupConsumer } = require('@mualdoo/shared');
const { sendAccountVerificationEmail } = require('../services/email-service');

async function startConsumers() {
    try {
        const conn = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await conn.createChannel();

        channel.prefetch(1);
        
        // Consumer after creating an appointment
        await setupConsumer(
            channel,
            'appointment_created_exchange',
            'appointment_confirm_queue',
            async (data) => {
                return await sendAccountVerificationEmail(data);
            }
        );

        console.log('notification-service listening messages');
    } catch (error) {
        console.error('Error connecting to rabbitMQ:', error.message);
        setTimeout(startConsumers, 5000);
    }
}

module.exports = { startConsumers }