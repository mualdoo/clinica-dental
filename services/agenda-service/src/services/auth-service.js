import axios from 'axios'

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL

export default async (userId) => {
    try {
        const response = await axios.get(
            `${AUTH_SERVICE_URL}/user-info/${userId}`,
            { headers: { 'x-internal-key': process.env.INTERNAL_SERVICE_KEY } }
        )

        if (!response.data.success) return null

        return response.data.data
    } catch (error) {
        return null
    }
}
