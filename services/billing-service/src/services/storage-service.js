import axios from 'axios'

// Tu URL local para el entorno de desarrollo
const STORAGE_SERVICE_URL = process.env.STORAGE_SERVICE_URL

/**
 * Sube un archivo desde el navegador web al microservicio.
 *
 * @param {File} fileObject - El objeto File nativo del navegador (obtenido de un <input type="file">).
 * @returns {Promise<string>} La URL pública del archivo subido.
 */
export const uploadFile = async (fileObject) => {
    try {
        const formData = new FormData()

        // Cambio clave: En la web pasas el objeto File directamente,
        // sin necesidad de especificar manualmente uri, type o name.
        formData.append('file', fileObject)

        const response = await axios.post(
            `${STORAGE_SERVICE_URL}/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-internal-key': process.env.INTERNAL_SERVICE_KEY,
                },
            }
        )

        if (response.data && response.data.success) {
            return response.data.url
        } else {
            throw new Error('El servidor no devolvió una URL válida.')
        }
    } catch (error) {
        console.error(
            'Error subiendo archivo desde la web:',
            error?.response?.data || error.message
        )
        throw error
    }
}

/**
 * Elimina un archivo del almacenamiento en la nube usando su URL pública.
 *
 * @param {string} fileUrl - La URL completa del archivo que devuelve Supabase.
 * @returns {Promise<boolean>} Verdadero si se eliminó correctamente.
 */
export const deleteFile = async (fileUrl) => {
    try {
        const response = await axios.delete(`${STORAGE_SERVICE_URL}/delete`, {
            data: { fileUrl }, // Axios requiere que el body de un DELETE vaya dentro de la propiedad 'data'
            headers: {
                'Content-Type': 'application/json',
                'x-internal-key': process.env.INTERNAL_SERVICE_KEY,
            },
        })

        if (response.data && response.data.success) {
            return true
        } else {
            throw new Error('El servidor no confirmó la eliminación.')
        }
    } catch (error) {
        console.error(
            'Error en deleteFile:',
            error?.response?.data || error.message
        )
        throw error
    }
}
