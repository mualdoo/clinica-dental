'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { authService } from '@/lib/api/auth-service'
import {
    createSessionCookie,
    clearSessionCookie,
} from '@/lib/api/session-actions'
import { useAuthStore } from '@/store/auth-store'
import type { LoginPayload, RegisterPayload, UserRole } from '@/types/auth'
import { toast } from 'sonner'

function getRedirectPath(role: UserRole): string {
    return role === 'patient' ? '/portal' : '/agenda'
}

export function useAuth() {
    const router = useRouter()
    const { setAuth, clearAuth, user, isAuthenticated, accessToken } =
        useAuthStore()
    const [isLoading, setIsLoading] = useState(false)

    const login = async (payload: LoginPayload) => {
        setIsLoading(true)
        try {
            const response = await authService.login(payload)
            const { user, accessToken } = response.data

            setAuth(user, accessToken)
            await createSessionCookie(user)

            toast.success('Bienvenido/a', {
                position: 'bottom-center',
            })
            router.push(getRedirectPath(user.role))
        } catch (err: any) {
            toast.error(err.message || 'Error al iniciar sesión', {
                position: 'bottom-center',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (payload: RegisterPayload) => {
        setIsLoading(true)
        try {
            const response = await authService.register(payload)
            const { user, accessToken } = response.data

            setAuth(user, accessToken)
            await createSessionCookie(user)

            toast.success('Cuenta creada exitosamente', {
                position: 'bottom-center',
            })
            router.push(getRedirectPath(user.role))
        } catch (err: any) {
            toast.error(err.message || 'No se pudo crear la cuenta', {
                position: 'bottom-center',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {
            await authService.logout()
        } catch {
        } finally {
            clearAuth()
            await clearSessionCookie()
            router.push('/login')
        }
    }

    return {
        user,
        isAuthenticated,
        accessToken,
        isLoading,
        login,
        register,
        logout,
    }
}
