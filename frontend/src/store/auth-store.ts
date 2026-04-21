import { create } from 'zustand'
import type { AuthState, User } from '@/types/auth'

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,

    setAuth: (user: User, token: string) =>
        set({ user, accessToken: token, isAuthenticated: true }),

    clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),

    setAccessToken: (token: string) => set({ accessToken: token }),
}))
