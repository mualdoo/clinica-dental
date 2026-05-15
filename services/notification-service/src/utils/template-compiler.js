import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import Handlebars from 'handlebars'

// 1. Recrear __dirname para ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// (Opcional) Un caché simple para no leer el disco duro en cada envío
const templateCache = new Map()

/**
 * Lee y compila una plantilla Handlebars.
 *
 * @param {string} templateName - El nombre de la plantilla (ej: 'confirmacion-cuenta')
 * @param {object} payload - Las variables a inyectar (ej: { fullName: 'Juan', link: '...' })
 * @returns {Promise<string>} HTML compilado listo para enviar
 */
export const renderTemplate = async (templateName, payload) => {
    try {
        // Agregar la extensión si no la pasaron
        const fileName = templateName.endsWith('.hbs')
            ? templateName
            : `${templateName}.hbs`

        // Ruta absoluta hacia tu carpeta de templates (ajusta el '../' según la ubicación de este archivo)
        const templatePath = path.join(__dirname, '../templates', fileName)

        let template

        // Verificar si la plantilla ya está en caché
        if (templateCache.has(fileName)) {
            template = templateCache.get(fileName)
        } else {
            // Si no está en caché, leer del disco duro
            const source = await fs.readFile(templatePath, 'utf-8')
            template = Handlebars.compile(source)

            // Guardar en caché para futuras llamadas
            templateCache.set(fileName, template)
        }

        // Retornar el HTML con las variables inyectadas
        return template(payload)
    } catch (error) {
        console.error(
            `[Error] Falló la compilación de la plantilla '${templateName}':`,
            error
        )
        throw new Error('Error al generar el formato del correo')
    }
}
