import { Router } from 'express'
import { uploadFile, deleteFile } from '../controllers/storage-controller.js'
import { uploadMiddleware } from '../config/multer.js'
import { hybridAuth } from '../middleware/storage-middleware.js'

const router = Router()

// Endpoint para subir (espera un campo form-data llamado 'file')
router.post(
    '/upload',
    hybridAuth(['admin', 'receptionist', 'dentist']),
    uploadMiddleware.single('file'),
    uploadFile
)

// Endpoint para eliminar (espera un JSON con { "fileUrl": "..." })
router.delete(
    '/delete',
    hybridAuth(['admin', 'receptionist', 'dentist']),
    deleteFile
)

export default router
