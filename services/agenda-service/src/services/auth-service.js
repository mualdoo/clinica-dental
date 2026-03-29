import axios from 'axios';

const AUTH_SERVICE_URL = 'http://auth-service:3001';

export default async (userId) => {
    try {
        const response = await axios.get(
            `${AUTH_SERVICE_URL}/user-info/${userId}`
        );
        
        if (!response.data.success) return null
        
        return response.data.data;
    } catch (error) {
        return null;
    }
};