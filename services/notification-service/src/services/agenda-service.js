import axios from 'axios'

const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY

export const setAppointmentSent = async (appointmentId) => {
    try {
        const response = await axios.patch(
            `${process.env.AGENDA_SERVICE_URL}/internal/appointment/${appointmentId}`,
            {},
            { headers: { 'x-internal-key': INTERNAL_KEY } }
        )

        if (!response.data.success) return false

        return response.data.data
    } catch (error) {
        return false
    }
}
