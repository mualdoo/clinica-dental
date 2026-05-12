import axios from 'axios'

const internalHeaders = {
    'x-internal-secret': process.env.INTERNAL_SERVICE_KEY,
}

const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString()
}

const sendReminder = async (appointment) => {
    await axios.post(
        `${process.env.NOTIFICATIONS_SERVICE_URL}/api/v1/notifications/send`,
        {
            type: 'APPOINTMENT_REMINDER',
            channel: ['whatsapp', 'email'],
            payload: {
                patientName: appointment.patientName,
                patientPhone: appointment.patientPhone,
                patientEmail: appointment.patientEmail,
                doctorName: appointment.doctorName,
                date: appointment.startTime,
                cubicle: appointment.cubicle,
            },
        },
        { headers: internalHeaders }
    )
}

export default async function sendReminders() {
    console.log(`[${new Date().toISOString()}] Buscando citas para mañana...`)

    try {
        const now = new Date().toISOString()
        const tomorrow = getTomorrowDate()

        const { data } = await axios.get(
            `${process.env.AGENDA_SERVICE_URL}/internal/appointment`,
            {
                headers: internalHeaders,
                params: {
                    startTime: now,
                    endTime: tomorrow,
                },
            }
        )

        const appointments = data.data

        if (!appointments.length) {
            console.log('📭 No hay citas mañana, nada que notificar.')
            return
        }

        console.log(`📋 Encontradas ${appointments.length} citas para mañana.`)

        const results = await Promise.allSettled(
            appointments.map((appointment) => sendReminder(appointment))
        )

        const sent = results.filter((r) => r.status === 'fulfilled').length
        const failed = results.filter((r) => r.status === 'rejected').length

        console.log(`✅ Enviados: ${sent} | ❌ Fallidos: ${failed}`)
    } catch (err) {
        console.error('❌ Error en sendReminders:', err.message)
    }
}
