import {
    uploadFileToCloud,
    deleteFileFromCloud,
} from '../services/supabase-service.js'

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res
                .status(400)
                .json({ error: 'No se detectó ningún archivo en la petición.' })
        }

        const publicUrl = await uploadFileToCloud(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        )

        return res.status(200).json({
            success: true,
            message: 'Archivo subido correctamente',
            url: publicUrl,
        })
    } catch (error) {
        console.error('[Storage Controller - Upload]', error)
        return res.status(500).json({ success: false, error: error.message })
    }
}

export const deleteFile = async (req, res) => {
    try {
        const { fileUrl } = req.body

        if (!fileUrl) {
            return res
                .status(400)
                .json({
                    error: 'Se requiere la URL del archivo para eliminarlo.',
                })
        }

        await deleteFileFromCloud(fileUrl)

        return res.status(200).json({
            success: true,
            message: 'Archivo eliminado correctamente',
        })
    } catch (error) {
        console.error('[Storage Controller - Delete]', error)
        return res.status(500).json({ success: false, error: error.message })
    }
}
