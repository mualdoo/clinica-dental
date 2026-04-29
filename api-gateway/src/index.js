import 'dotenv/config'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { authenticateToken } from './middleware/auth-middleware.js'

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

const PORT = process.env.PORT
const HOST = process.env.HOST

app.listen(PORT, HOST, () => {
    console.log(`API Gateway corriendo en puerto ${PORT}`)
})
