'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { authService } from '@/lib/api/auth-service'
import { useAuthStore } from '@/store/auth-store'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { LoginPayload, RegisterPayload, UserRole } from '@/types/auth'
import { toast } from 'sonner'

function getLoginRedirect(role: UserRole): string {
    if (role === 'patient') return '/portal/seleccionar-perfil'
    return '/agenda'
}

function getRegisterRedirect(role: UserRole): string {
    if (role === 'patient') return '/portal/completar-perfil'
    return '/agenda'
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
            router.push(getLoginRedirect(user.role))
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
            router.push(getRegisterRedirect(user.role))
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
            // Limpia el perfil activo
            document.cookie = 'activePatientId=; path=/; max-age=0'
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

export function useSendVerificationEmail() {
    return useMutation({
        mutationFn: (id: string) => authService.sendVerificationEmail(id),
        onSuccess: () => {
            toast.success('Correo enviado correctamente')
        },
        onError: (err: Error) => toast.error(err.message),
    })
}
