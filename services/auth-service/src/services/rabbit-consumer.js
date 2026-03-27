const amqp = require('amqplib');
const { setupConsumer } = require('@mualdoo/shared');
const { createPatientAccount } = require('./patient-account-service');

async function startConsumers() {
    try {
        const conn = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await conn.createChannel();

        channel.prefetch(1);
        
        // Consumer after creating a patient
        await setupConsumer(
            channel,
            'patient_created_exchange',
            'patient_account_queue',
            async (data) => {
                return await createPatientAccount(data);
            }
        );

        console.log('patient-account-service listening messages');
    } catch (error) {
        console.error('Error connecting to rabbitMQ:', error.message);
        setTimeout(startConsumers, 5000);
    }
}

module.exports = { startConsumers }