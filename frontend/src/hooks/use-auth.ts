'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { authService } from '@/lib/api/auth-service'
import {
    createSessionCookie,
    clearSessionCookie,
} from '@/lib/api/session-actions'
import { useAuthStore } from '@/store/auth-store'
import type { LoginPayload, RegisterPayload, UserRole } from '@/types/auth'

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
            if (!response.success) {
                toast.error('Credenciales inválidas')
                return
            }
            const { user, accessToken } = response.data
            setAuth(user, accessToken)
            await createSessionCookie(user)
            toast.success('Bienvenido/a')
            router.push(getRedirectPath(user.role))
        } catch (err: unknown) {
            toast.error(
                err instanceof Error ? err.message : 'Error al iniciar sesión'
            )
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (payload: RegisterPayload) => {
        setIsLoading(true)
        try {
            const response = await authService.register(payload)
            if (!response.success) {
                toast.error('No se pudo crear la cuenta')
                return
            }
            const { user, accessToken } = response.data
            setAuth(user, accessToken)
            await createSessionCookie(user)
            toast.success('Cuenta creada exitosamente')
            router.push(getRedirectPath(user.role))
        } catch (err: unknown) {
            toast.error(
                err instanceof Error ? err.message : 'Error al registrarse'
            )
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {
            await authService.logout()
        } catch {
            /* limpiar local de todas formas */
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
