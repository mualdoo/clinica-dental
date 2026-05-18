import multer from 'multer'

// Guardar en memoria es ideal para microservicios y contenedores
const storage = multer.memoryStorage()

export const uploadMiddleware = multer({
    storage,
    limits: {
        fileSize: 15 * 1024 * 1024, // Límite de 5 MB por archivo para la demo
    },
})
