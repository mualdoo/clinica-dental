import axios from 'axios'

export const verifyPatient = async (patientId, authUserId) => {
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

export const patientExists = async (patientId) => {
    try {
        const response = await axios.get(
            `${process.env.PATIENT_SERVICE_URL}/internal/patient-exists?patientId=${patientId}`,
            { headers: { 'x-internal-key': process.env.INTERNAL_SERVICE_KEY } }
        )

        if (!response.data.success) return false

        return response.data.data
    } catch (error) {
        return false
    }
}

export const createPatientPdf = async (patientId, dto) => {
    try {
        console.log('dto__====', patientId, dto)

        const response = await axios.post(
            `${process.env.PATIENT_SERVICE_URL}/internal/${patientId}/pdf`,
            dto,
            { headers: { 'x-internal-key': process.env.INTERNAL_SERVICE_KEY } }
        )

        if (!response.data.success) return false

        return response.data.data
    } catch (error) {
        console.log(error)

        return false
    }
}
