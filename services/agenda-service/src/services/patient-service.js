import axios from 'axios'

const PATIENT_SERVICE_URL = process.env.PATIENT_SERVICE_URL
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY

export const verifyPatient = async (patientId, authUserId) => {
    try {
        const response = await axios.get(
            `${PATIENT_SERVICE_URL}/internal/verify-patient?patientId=${patientId}&authUserId=${authUserId}`,
            { headers: { 'x-internal-key': INTERNAL_KEY } }
        )

        if (!response.data.success) return false

        return response.data.data.valid
    } catch (error) {
        return false
    }
}

export const patientExists = async (patientId) => {
    try {
        console.log('hola al inicio')

        const response = await axios.get(
            `${PATIENT_SERVICE_URL}/internal/patient-exists?patientId=${patientId}`,
            { headers: { 'x-internal-key': INTERNAL_KEY } }
        )
        console.log('jala esto??')

        if (!response.data.success) return false

        return response.data.data
    } catch (error) {
        return false
    }
}
