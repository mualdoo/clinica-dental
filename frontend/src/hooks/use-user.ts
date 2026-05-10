'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authService } from '@/lib/api/auth-service'
import type { RegisterPayload, UserRole } from '@/types/auth'

export const userKeys = {
    dentists: () => ['users', 'dentists'] as const,
}

export function useUsers(role: UserRole) {
    return useQuery({
        queryKey: userKeys.dentists(),
        queryFn: () => authService.listUsers(role),
        staleTime: 5 * 60 * 1000,
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
