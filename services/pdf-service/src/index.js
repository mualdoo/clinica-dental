import express from 'express'
import { generateQuotePDF } from './services/pdf-service.js'

const app = express()
app.use(express.json())

app.post('/quote', async (req, res) => {
    try {
        const quoteData = req.body

        if (!quoteData || !quoteData.id) {
            return res
                .status(400)
                .json({ error: 'Datos del presupuesto inválidos' })
        }

        const pdfBuffer = await generateQuotePDF(quoteData)

        res.contentType('application/pdf')
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=presupuesto-${quoteData.id}.pdf`
        )
        return res.send(pdfBuffer)
    } catch (error) {
        console.error('Error al generar el PDF:', error)
        return res
            .status(500)
            .json({ error: 'Error interno al generar el PDF' })
    }
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Servicio de PDF ejecutándose en el puerto ${PORT}`)
})
