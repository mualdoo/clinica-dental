'use client'

import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
    keepPreviousData,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { authService } from '@/lib/api/auth-service'
import type { RegisterPayload, UserParams, UserRole } from '@/types/auth'

export const userKeys = {
    dentists: () => ['users', 'dentists'] as const,
}

export function useUsers(role: UserRole | null) {
    return useQuery({
        queryKey: role ? [role] : ['users'],
        queryFn: () => authService.listUsers(role ? { role } : {}),
        staleTime: 5 * 60 * 1000,
    })
}

export function useInfiniteUsers(params: Omit<UserParams, 'page'> = {}) {
    return useInfiniteQuery({
        // Es mejor tener 'users' como base siempre en la key para invalidar más fácil después
        queryKey: params.role ? ['users', params.role] : ['users'],

        // Recibimos pageParam que React Query maneja automáticamente
        queryFn: ({ pageParam = 1 }) =>
            authService.listUsers({
                ...params,
                page: pageParam as number,
                limit: params.limit ?? 10,
            }),

        initialPageParam: 1,

        // Lógica para determinar si hay más páginas
        getNextPageParam: (lastPage) => {
            const { page, totalPages } = lastPage.data
            return page < totalPages ? page + 1 : undefined
        },

        // Mantenemos la opción para evitar parpadeos al cambiar filtros
        placeholderData: keepPreviousData,
    })
}

export function useRegisterUser() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload: RegisterPayload) =>
            authService.registerUser(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: userKeys.dentists() })
            toast.success('Usuario registrado correctamente')
        },
        onError: (e: Error) => toast.error(e.message),
    })
}
