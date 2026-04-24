'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { authService } from '@/lib/api/auth-service'
import { useAuthStore } from '@/store/auth-store'
import { useQuery } from '@tanstack/react-query'
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

            toast.success('Bienvenido/a')
            router.push(getRedirectPath(user.role))
        } catch (err: any) {
            toast.error(err.message || 'Error al iniciar sesión')
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

            toast.success('Cuenta creada exitosamente')
            router.push(getRedirectPath(user.role))
        } catch (err: any) {
            toast.error(err.message || 'No se pudo crear la cuenta')
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

export function useSearchDentists(query: string) {
    return useQuery({
        queryKey: ['patients', 'search', query],
        queryFn: () => authService.search(query),
        enabled: query.trim().length >= 2, // no busca con menos de 2 caracteres
        staleTime: 10 * 1000, // caché de 10s para no spamear al backend
    })
}
