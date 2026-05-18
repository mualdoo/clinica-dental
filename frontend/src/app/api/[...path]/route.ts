import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { useAuthStore } from '@/store/auth-store'

const GATEWAY = process.env.API_GATEWAY_URL

async function handler(req: NextRequest) {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    const targetPath = req.nextUrl.pathname.replace(/^\/api/, '')
    const targetUrl = `${GATEWAY}${targetPath}${req.nextUrl.search}`

    const headers = new Headers(req.headers)
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`)
    }

    const activePatientId = cookieStore.get('activePatientId')?.value
    if (activePatientId) headers.set('x-active-patient-id', activePatientId)

    headers.delete('host')
    headers.delete('connection')

    const body =
        req.method !== 'GET' && req.method !== 'HEAD'
            ? await req.arrayBuffer()
            : undefined

    let response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body,
        credentials: 'include',
    })

    if (response.status === 401) {
        const refreshToken = cookieStore.get('refreshToken')?.value

        if (refreshToken) {
            const refreshRes = await fetch(`${GATEWAY}/auth/refresh`, {
                method: 'POST',
                headers: { Cookie: `refreshToken=${refreshToken}` },
            })

            if (refreshRes.ok) {
                const refreshData = await refreshRes.json()
                const newToken: string = refreshData?.data?.accessToken

                if (newToken) {
                    headers.set('Authorization', `Bearer ${newToken}`)
                    response = await fetch(targetUrl, {
                        method: req.method,
                        headers,
                        body,
                    })

                    const nextResponse = NextResponse.json(
                        await response.json(),
                        {
                            status: response.status,
                        }
                    )
                    nextResponse.cookies.set('accessToken', newToken, {
                        httpOnly: true,
                        sameSite: 'strict',
                        path: '/',
                    })

                    response.headers.getSetCookie().forEach((cookie) => {
                        nextResponse.headers.append('Set-Cookie', cookie)
                    })
                    return nextResponse
                }
            }
        }

        const failResponse = NextResponse.json(
            { success: false, message: 'Sesión expirada' },
            { status: 401 }
        )
        failResponse.cookies.delete('accessToken')
        failResponse.cookies.delete('refreshToken')
        return failResponse
    }

    const data = response.status === 204 ? null : await response.json()
    const nextResponse = NextResponse.json(data, { status: response.status })

    response.headers.getSetCookie().forEach((cookie) => {
        nextResponse.headers.append('Set-Cookie', cookie)
    })

    return nextResponse
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
