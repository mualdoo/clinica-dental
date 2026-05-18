import express from 'express'
import cors from 'cors'
import storageRoutes from './routes/storage-routes.js'

const app = express()

// Middlewares globales
app.use(cors()) // Permite peticiones desde la app móvil o web
app.use(express.json()) // Para parsear el body en peticiones DELETE (JSON)
app.use(express.urlencoded({ extended: true }))

// Rutas de salud (Healthcheck) para verificar en el orquestador (ej. Docker)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'Storage Service' })
})

// Montar las rutas principales
app.use('/', storageRoutes)

export default app
