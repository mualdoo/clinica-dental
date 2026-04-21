import { apiClient } from './api-client'
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types/auth'

export const authService = {
    login: (payload: LoginPayload) =>
        apiClient<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
            withAuth: false,
        }),

    register: (payload: RegisterPayload) =>
        apiClient<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload),
            withAuth: false,
        }),
    logout: () =>
        apiClient<void>('/auth/logout', {
            method: 'POST',
        }),
}
