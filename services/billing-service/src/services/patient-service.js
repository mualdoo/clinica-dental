import axios from 'axios';

const PATIENT_SERVICE_URL = 'http://patient-service:3003';

export default async (patientId) => {
    try {
        const response = await axios.get(
            `${PATIENT_SERVICE_URL}/${patientId}`
        );
        
        if (!response.data.success) return null
        
        return response.data.data;
    } catch (error) {
        return null;
    }
};