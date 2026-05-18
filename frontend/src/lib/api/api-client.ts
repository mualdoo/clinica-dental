import { useAuthStore } from '@/store/auth-store'

const GATEWAY_PROXY = '/api'

type RequestOptions = RequestInit & {
    withAuth?: boolean
}

export async function apiClient<T = unknown>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const { withAuth = true, headers, ...rest } = options
    const finalHeaders = new Headers(headers as HeadersInit)
    // Si hay un body, y NO es un FormData (archivo), y no tiene Content-Type previo...
    if (
        rest.body &&
        !(rest.body instanceof FormData) &&
        !finalHeaders.has('Content-Type')
    ) {
        // ...entonces forzamos que sea JSON.
        finalHeaders.set('Content-Type', 'application/json')
    }

    const res = await fetch(`${GATEWAY_PROXY}${path}`, {
        ...rest,
        headers: finalHeaders, // Pasamos nuestros headers procesados
        credentials: 'include',
    })

    if (res.status === 401 && withAuth) {
        useAuthStore.getState().clearAuth()
        throw new ApiError(
            401,
            'Sesión expirada. Por favor inicia sesión de nuevo.'
        )
    }

    if (!res.ok) {
        let message = `Error ${res.status}`
        try {
            const data = await res.json()
            message = data?.error ?? message
        } catch {}

        throw new ApiError(res.status, message)
    }

    if (res.status === 204) return undefined as T

    return res.json() as Promise<T>
}

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string
    ) {
        super(message)
        this.name = 'ApiError'
    }
}
