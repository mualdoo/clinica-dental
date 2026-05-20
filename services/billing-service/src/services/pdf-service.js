import axios from 'axios'

export const getPdfBuffer = async (quoteData) => {
    try {
        const response = await axios.post(
            `${process.env.PDF_SERVICE_URL}/quote`,
            quoteData,
            {
                responseType: 'arraybuffer',
            }
        )
        return response.data
    } catch (error) {
        console.log(error)
        return false
    }
}
