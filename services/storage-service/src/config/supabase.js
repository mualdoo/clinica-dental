import { createClient } from '@supabase/supabase-js'
import WebSocket from 'ws'

// 1. PARCHE DE WEBSOCKET: Si Node no tiene WebSocket nativo, le inyectamos la librería 'ws'
if (!globalThis.WebSocket) {
    globalThis.WebSocket = WebSocket
}

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY // ¡Usa la Service Role Key!

if (!supabaseUrl || !supabaseKey) {
    console.error('Faltan las credenciales de Supabase en el archivo .env')
    process.exit(1)
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false, // Desactiva el uso de localStorage (vital para el backend)
        detectSessionInUrl: false,
    },
})
