import { io, type Socket } from 'socket.io-client'

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL

let socket: Socket | null = null

export function getOdontogramaSocket(): Socket {
    if (!socket) {
        // src/lib/socket.ts — cambio temporal para debug
        // socket = io(`${GATEWAY_URL}/odontograma`, {
        //     path: '/socket.io',
        //     transports: ['polling', 'websocket'], // ← permite polling primero
        //     autoConnect: false,
        //     withCredentials: true,
        // })

        socket = io(`${GATEWAY_URL}/odontograma`, {
            path: '/socket.io',
            transports: ['websocket'],
            autoConnect: false,
            withCredentials: true,
        })

        socket.on('connect', () => console.log('[WS] Conectado al gateway'))
        socket.on('disconnect', (r) => console.log('[WS] Desconectado:', r))
        socket.on('connect_error', (e) =>
            console.error('[WS] Error:', e.message)
        )
    }

    return socket
}

export function destroyOdontogramaSocket() {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}
