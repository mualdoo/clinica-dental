import cron from 'node-cron'
import sendReminders from './jobs/send-reminders.js'

console.log('Reminder Worker iniciado')

// Corre cada hora en punto
cron.schedule('0 * * * *', async () => {
    await sendReminders()
    // TODO: marcar las citas como missed
    // TODO: eliminar ActivationTokens
})

// Corre una vez al arrancar para verificar que todo funciona
sendReminders()
