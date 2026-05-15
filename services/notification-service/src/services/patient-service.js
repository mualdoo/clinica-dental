import axios from 'axios'

const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY

export const patientExists = async (patientId) => {
    try {
        const response = await axios.get(
            `${PATIENT_SERVICE_URL}/internal/patient-exists?patientId=${patientId}`,
            { headers: { 'x-internal-key': INTERNAL_KEY } }
        )

        if (!response.data.success) return false

        return response.data.data
    } catch (error) {
        return false
    }
}
