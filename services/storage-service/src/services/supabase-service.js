import { supabase } from '../config/supabase.js'

const BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME

export const uploadFileToCloud = async (fileBuffer, fileName, mimeType) => {
    // 1. Limpieza extrema: Mantiene solo letras, números, puntos y guiones
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '')

    // 2. Generamos la ruta
    const filePath = `uploads/${Date.now()}_${safeFileName}`

    // 3. Diagnóstico en terminal
    console.log('--- DIAGNÓSTICO DE SUBIDA ---')
    console.log('URL Base:', process.env.SUPABASE_URL)
    console.log('Bucket objetivo:', process.env.SUPABASE_BUCKET_NAME)
    console.log('Ruta del archivo:', filePath)
    console.log('-----------------------------')

    const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME)
        .upload(filePath, fileBuffer, {
            contentType: mimeType,
            upsert: false,
        })

    if (error) {
        throw new Error(`Error al subir a Supabase: ${error.message}`)
    }

    // Obtener la URL pública del archivo recién subido
    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path)

    return urlData.publicUrl
}

export const deleteFileFromCloud = async (fileUrl) => {
    // Extraer la ruta relativa del archivo a partir de la URL completa
    const urlParts = fileUrl.split(`${BUCKET_NAME}/`)
    if (urlParts.length !== 2) throw new Error('URL de archivo inválida')

    const filePath = urlParts[1]

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath])

    if (error) {
        throw new Error(`Error al eliminar de Supabase: ${error.message}`)
    }

    return true
}
