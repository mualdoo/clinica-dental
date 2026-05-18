import { apiClient } from './api-client'

export interface UploadResponse {
    success: boolean
    message: string
    url: string
}

export interface DeleteFileResponse {
    success: boolean
    message: string
}

export const storageService = {
    /**
     * Sube un archivo físico al microservicio de almacenamiento a través del API Gateway.
     */
    upload: (file: File) => {
        const formData = new FormData()
        formData.append('file', file)

        // Al pasar FormData como body, 'fetch' dentro de apiClient se encarga
        // automáticamente de asignar el Content-Type adecuado con su boundary.
        return apiClient<UploadResponse>('/storage/upload', {
            method: 'POST',
            body: formData,
        })
    },

    /**
     * Elimina un archivo de la nube proporcionando su URL pública.
     */
    remove: (fileUrl: string) => {
        return apiClient<DeleteFileResponse>('/storage/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileUrl }),
        })
    },
}
