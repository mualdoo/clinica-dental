export type UserRole = 'patient' | 'dentist' | 'admin' | 'receptionist'

export interface User {
    id: string
    email: string
    role: UserRole
    name?: string
    lastName?: string
}

export interface AuthResponse {
    success: boolean
    data: {
        user: User
        accessToken: string
    }
    error?: string
}

export interface LoginPayload {
    email: string
    password: string
}

export interface RegisterPayload {
    email: string
    password: string
    name: string
    lastName: string
}

export interface AuthState {
    user: User | null
    accessToken: string | null
    isAuthenticated: boolean
    setAuth: (user: User, token: string) => void
    clearAuth: () => void
    setAccessToken: (token: string) => void
}
