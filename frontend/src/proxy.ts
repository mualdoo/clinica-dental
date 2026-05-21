import { NextRequest, NextResponse } from 'next/server'
import type { UserRole } from '@/types/auth'

const PUBLIC_ROUTES = ['/login', '/register', '/verificar-cuenta']

const ROLE_ROUTES: Record<string, UserRole[]> = {
    '/agenda': ['dentist', 'admin', 'receptionist'],
    '/portal': ['patient'],
    '/settings': ['admin'],
}

function getRedirectPath(role: UserRole): string {
    return role === 'patient' ? '/portal' : '/agenda'
}

function parseAccessToken(
    token: string | undefined
): { id: string; role: UserRole } | null {
    if (!token) return null
    try {
        const payload = token.split('.')[1]
        const decoded = JSON.parse(
            Buffer.from(payload, 'base64url').toString('utf-8')
        )
        return { id: decoded.id, role: decoded.role }
    } catch {
        return null
    }
}

function matchesRoute(pathname: string, routePrefix: string): boolean {
    return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`)
}

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl

    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    const sessionCookie = req.cookies.get('accessToken')?.value
    const session = parseAccessToken(sessionCookie)

    if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
        if (session) {
            const dest = getRedirectPath(session.role)
            return NextResponse.redirect(new URL(dest, req.url))
        }
        return NextResponse.next()
    }

    if (pathname === '/') {
        if (!session) {
            return NextResponse.redirect(new URL('/login', req.url))
        }
        const dest = getRedirectPath(session.role)
        return NextResponse.redirect(new URL(dest, req.url))
    }

    if (!session) {
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
        if (matchesRoute(pathname, routePrefix)) {
            if (!allowedRoles.includes(session.role)) {
                const dest = getRedirectPath(session.role)
                return NextResponse.redirect(new URL(dest, req.url))
            }
            break
        }
    }

    // Rutas del portal que requieren perfil seleccionado
    if (
        matchesRoute(pathname, '/portal') &&
        !pathname.includes('seleccionar-perfil') &&
        !pathname.includes('completar-perfil')
    ) {
        const activePatientId = req.cookies.get('activePatientId')?.value
        if (!activePatientId) {
            return NextResponse.redirect(
                new URL('/portal/seleccionar-perfil', req.url)
            )
        }
    }
    if (
        pathname.match(/^\/pacientes\/[^/]+/) &&
        session?.role === 'receptionist'
    ) {
        return NextResponse.redirect(new URL('/pacientes', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
