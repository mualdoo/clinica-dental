import { useAuthStore } from '@/store/auth-store'

const GATEWAY = process.env.NEXT_PUBLIC_API_URL

type RequestOptions = RequestInit & {
    withAuth?: boolean
    _retryCount?: number
}

function buildHeaders(
    extra: HeadersInit = {},
    token: string | null
): HeadersInit {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(extra as Record<string, string>),
    }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
}

async function silentRefresh(): Promise<string | null> {
    try {
        const res = await fetch(`${GATEWAY}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
        })

        if (!res.ok) return null

        const json = await res.json()
        const newToken: string | undefined = json?.data?.accessToken
        if (!newToken) return null

        useAuthStore.getState().setAccessToken(newToken)
        return newToken
    } catch {
        return null
    }
}

export async function apiClient<T = unknown>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const { withAuth = true, _retryCount = 1, headers, ...rest } = options

    const token = withAuth ? useAuthStore.getState().accessToken : null

    const res = await fetch(`${GATEWAY}${path}`, {
        ...rest,
        credentials: 'include',
        headers: buildHeaders(headers, token),
    })

    if (res.status === 401 && withAuth && _retryCount > 0) {
        const newToken = await silentRefresh()

        if (newToken) {
            return apiClient<T>(path, {
                ...options,
                _retryCount: 0,
                headers: buildHeaders(headers, newToken),
            })
        }

        useAuthStore.getState().clearAuth()
        throw new ApiError(
            401,
            'Sesión expirada. Por favor inicia sesión de nuevo.'
        )
    }

    if (!res.ok) {
        let message = `Error ${res.status}`
        try {
            const body = await res.json()
            message = body?.message ?? message
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
