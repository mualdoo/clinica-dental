import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Recrear __dirname que no está disponible por defecto en ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Instancia global para optimizar tiempos de respuesta (Warm Pool)
let browserInstance = null

async function getBrowser() {
    if (!browserInstance) {
        browserInstance = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ],
        })
    }
    return browserInstance
}

function formatCurrency(value) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(value)
}

function formatDate(dateString) {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export async function generateQuotePDF(data) {
    const browser = await getBrowser()
    const page = await browser.newPage()

    try {
        const templatePath = path.join(
            __dirname,
            '../templates/quote-template.html'
        )
        let htmlContent = fs.readFileSync(templatePath, 'utf8')

        const logoPath = path.join(__dirname, '../assets/logo-clinica.svg')
        let logoBase64 = ''

        if (fs.existsSync(logoPath)) {
            const logoBuffer = fs.readFileSync(logoPath)
            logoBase64 = `data:image/svg+xml;base64,${logoBuffer.toString('base64')}`
        }

        const itemsHtml = data.items
            .map((item) => {
                const unitPrice = item.treatment.unitPrice
                const discountAmount = unitPrice * (item.discount || 0)
                const finalPrice = unitPrice - discountAmount

                return `
                <tr>
                    <td>Pieza ${item.toothNumber || 'General'} - ${item.treatment.name}</td>
                    <td class="text-right">${formatCurrency(unitPrice)}</td>
                    <td class="text-right">${item.discount * 100}%</td>
                    <td class="text-right">${formatCurrency(finalPrice)}</td>
                </tr>
            `
            })
            .join('')

        htmlContent = htmlContent
            .replace('{{logoBase64}}', logoBase64)
            .replace('{{quoteId}}', data.id)
            .replace('{{createdAt}}', formatDate(data.createdAt))
            .replace('{{validUntil}}', formatDate(data.validUntil))
            .replace('{{patientName}}', data.patientName)
            .replace('{{patientEmail}}', data.patientEmail)
            .replace('{{items}}', itemsHtml)
            .replace('{{total}}', formatCurrency(data.total))
            .replace('{{status}}', data.status.toUpperCase())

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm',
            },
        })

        return pdfBuffer
    } finally {
        await page.close()
    }
}
