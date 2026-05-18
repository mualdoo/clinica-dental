import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { createProxyMiddleware } from 'http-proxy-middleware'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { authenticateToken } from './middleware/auth-middleware.js'
import { initSocketProxy } from './socket-proxy.js'
import { verifyInternalKey } from './middleware/internal.js'

const getProxyMidleware = (target, options = {}) => {
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        onProxyReq: (proxyReq, req) => {
            proxyReq.setHeader('x-user-id', req.headers['x-user-id'])
            proxyReq.setHeader('x-user-role', req.headers['x-user-role'])
            if (req.headers['x-active-patient-id'])
                proxyReq.setHeader(
                    'x-active-patient-id',
                    req.headers['x-active-patient-id']
                )
        },
        ...options,
    })
}

const app = express()

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
)
app.use(cookieParser())

app.post(
    '/internal/tooth-event',
    express.json(),
    verifyInternalKey,
    async (req, res) => {
        const { patientId, event, tooth, toothId, toothNumber } = req.body

        if (!patientId || !event) {
            return res
                .status(400)
                .json({
                    success: false,
                    error: 'patientId y event son requeridos',
                })
        }

        try {
            const { emitToothEvent } = await import('./socket-proxy.js')
            emitToothEvent(patientId, { event, tooth, toothId, toothNumber })
            res.sendStatus(200)
        } catch (err) {
            console.error('[WS] Error emitiendo evento:', err)
            res.sendStatus(500)
        }
    }
)

app.get('/', (req, res) => {
    res.json({ message: 'API Gateway funcionando' })
})

app.post(
    '/auth/admin/register-user',
    authenticateToken,
    getProxyMidleware('http://auth-service:3001', {
        pathRewrite: {
            '^/auth': '',
        },
    })
)

app.get(
    '/auth/dentist/search',
    authenticateToken,
    getProxyMidleware('http://auth-service:3001', {
        pathRewrite: {
            '^/auth': '',
        },
    })
)

app.get(
    '/auth/user',
    authenticateToken,
    getProxyMidleware('http://auth-service:3001', {
        pathRewrite: {
            '^/auth': '',
        },
    })
)

app.use(
    '/auth',
    createProxyMiddleware({
        target: 'http://auth-service:3001',
        changeOrigin: true,
    })
)

app.use(
    '/agenda',
    authenticateToken,
    getProxyMidleware('http://agenda-service:3002')
)

app.use(
    '/patient',
    authenticateToken,
    getProxyMidleware('http://patient-service:3003')
)

app.use(
    '/billing',
    authenticateToken,
    getProxyMidleware('http://billing-service:3004')
)

app.use(
    '/inventory',
    authenticateToken,
    getProxyMidleware('http://inventory-service:3005')
)

const httpServer = createServer(app)

initSocketProxy(httpServer)

const PORT = process.env.PORT
const HOST = process.env.HOST

httpServer.listen(PORT, HOST, () => {
    console.log(`API Gateway corriendo en puerto ${PORT}`)
})
