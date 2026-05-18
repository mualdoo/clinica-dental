import { createServer } from 'http'
import { Server } from 'socket.io'
import { verifyJwt } from './middleware/auth-middleware.js'

/** @type {Server | null} */
let io = null

/**
 * Inicializa Socket.IO en el servidor HTTP del gateway.
 * El namespace /odontograma actúa como proxy transparente
 * hacia el microservicio de pacientes.
 * @param {import("http").Server} httpServer
 */
export function initSocketProxy(httpServer) {
    console.log('[WS] FRONTEND_URL:', process.env.FRONTEND_URL)

    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
            methods: ['GET', 'POST'],
        },
        // Mismo path que usará el cliente
        path: '/socket.io',
    })

    // Middleware de autenticación — valida el JWT antes de conectar
    io.use((socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ??
                socket.handshake.headers?.authorization?.split(' ')[1] ??
                socket.handshake.headers?.cookie
                    ?.split(';')
                    .find((c) => c.trim().startsWith('accessToken='))
                    ?.split('=')[1]

            if (!token) return next(new Error('No autorizado'))

            // Reutiliza tu función de verificación JWT existente en el gateway
            const decodedUser = verifyJwt(token)

            // Guarda el usuario en el socket para usarlo después si lo necesitas
            socket.data.userId = decodedUser.id
            socket.data.role = decodedUser.role

            next()
        } catch {
            next(new Error('Token inválido'))
        }
    })

    const odontograma = io.of('/odontograma')
    console.log('[WS] Namespace /odontograma registrado')

    odontograma.on('connection', (socket) => {
        console.log(`[WS] Cliente conectado: ${socket.id}`)

        socket.on('join-patient', (patientId) => {
            socket.join(`patient:${patientId}`)
            socket.emit('joined', { patientId })
            console.log(`[WS] ${socket.id} se unió a patient:${patientId}`)
        })

        socket.on('leave-patient', (patientId) => {
            socket.leave(`patient:${patientId}`)
            console.log(`[WS] ${socket.id} salió de patient:${patientId}`)
        })

        socket.on('disconnect', () => {
            console.log(`[WS] Cliente desconectado: ${socket.id}`)
        })
    })

    console.log('[WS] Socket.IO inicializado en el gateway')
    return io
}

/**
 * Emite un evento de diente actualizado a todos los clientes
 * en la sala del paciente. Lo llama el endpoint interno.
 * @param {string} patientId
 * @param {{ event: "created"|"updated"|"deleted", tooth?: object, toothId?: string, toothNumber?: number }} payload
 */
export function emitToothEvent(patientId, payload) {
    if (!io) throw new Error('Socket.IO no inicializado')
    io.of('/odontograma')
        .to(`patient:${patientId}`)
        .emit('tooth-updated', payload)
}
