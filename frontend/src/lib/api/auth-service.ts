import { PaginatedResponse } from '@/types/backend-response'
import { apiClient } from './api-client'
import type {
    AuthResponse,
    LoginPayload,
    RegisterPayload,
    User,
    UserRole,
} from '@/types/auth'

// ─── Helper: convierte un objeto de params a query string ─────────────────────
function toQueryString(params: Record<string, unknown>): string {
    const query = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(
            ([k, v]) =>
                `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
        )
        .join('&')
    return query ? `?${query}` : ''
}

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
    listUsers: (role: UserRole | null) => {
        const qs = toQueryString({ role })
        return apiClient<PaginatedResponse<User>>(`/auth/user${qs}`)
    },
    registerUser: (payload: RegisterPayload) =>
        apiClient<AuthResponse>('/auth/admin/register-user', {
            method: 'POST',
            body: JSON.stringify(payload),
            withAuth: true,
        }),
}
