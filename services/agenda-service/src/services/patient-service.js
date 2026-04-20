import axios from 'axios'

export default async (patientId, authUserId) => {
    try {
        const response = await axios.get(
            `${process.env.PATIENT_SERVICE_URL}/internal/verify-patient?patientId=${patientId}&authUserId=${authUserId}`,
            { headers: { 'x-internal-key': process.env.INTERNAL_SERVICE_KEY } }
        )

        if (!response.data.success) return false

        return response.data.data.valid
    } catch (error) {
        return false
    }
}
