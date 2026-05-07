'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth-store'

// Helper para leer cookies en el entorno del cliente
function getClientCookie(name: string) {
    if (typeof document === 'undefined') return ''
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)

    // Extraemos el valor de la cookie y decodificamos por si tiene caracteres especiales
    if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift()
        return cookieValue ? decodeURIComponent(cookieValue) : ''
    }
    return ''
}

export function useAuthInit() {
    const { setAuth, setActivePatientId, isAuthenticated } = useAuthStore()
    const initialized = useRef(false)

    useEffect(() => {
        if (initialized.current || isAuthenticated) return
        initialized.current = true

        fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
            .then((res) => res.json())
            .then((data) => {
                if (data?.success && data?.data?.user) {
                    const activePatientId = getClientCookie('activePatientId')
                    setActivePatientId(activePatientId)
                    setAuth(data.data.user, '')
                }
            })
            .catch(() => {})
    }, [])
}
