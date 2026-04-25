'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth-store'

export function useAuthInit() {
    const { setAuth, isAuthenticated } = useAuthStore()
    const initialized = useRef(false)

    useEffect(() => {
        if (initialized.current || isAuthenticated) return
        initialized.current = true

        fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
            .then((res) => res.json())
            .then((data) => {
                if (data?.success && data?.data?.user) {
                    setAuth(data.data.user, '')
                }
            })
            .catch(() => {})
    }, [])
}
