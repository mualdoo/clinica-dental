import { PaginatedResponse } from '@/types/backend-response'
import { apiClient } from './api-client'
import type {
    AuthResponse,
    LoginPayload,
    RegisterPayload,
    User,
    UserRole,
} from '@/types/auth'

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
    search: (query: string) =>
        apiClient<PaginatedResponse<User>>(
            `/auth/dentist/search?key=${encodeURIComponent(query)}`
        ),
    listUsers: (role: UserRole) =>
        apiClient<PaginatedResponse<User>>(`/auth/user?role=${role}`),
    registerUser: (payload: RegisterPayload) =>
        apiClient<AuthResponse>('/auth/admin/register-user', {
            method: 'POST',
            body: JSON.stringify(payload),
            withAuth: true,
        }),
}
