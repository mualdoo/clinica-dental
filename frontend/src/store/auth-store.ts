import { create } from 'zustand'
import type { AuthState, User } from '@/types/auth'

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    activePatientId: null, // ← nuevo

    setAuth: (user: User, token: string) =>
        set({ user, accessToken: token, isAuthenticated: true }),

    clearAuth: () =>
        set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            activePatientId: null,
        }),

    setAccessToken: (token: string) => set({ accessToken: token }),

    setActivePatientId: (id: string | null) => set({ activePatientId: id }), // ← nuevo
}))
