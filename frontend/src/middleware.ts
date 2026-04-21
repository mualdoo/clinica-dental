import { NextRequest, NextResponse } from 'next/server'
import type { UserRole } from '@/types/auth'

const PUBLIC_ROUTES = ['/login', '/register']

const ROLE_ROUTES: Record<string, UserRole[]> = {
    '/agenda': ['dentist', 'admin', 'receptionist'],
    '/portal': ['patient'],
    '/settings': ['admin'],
}

function getRedirectPath(role: UserRole): string {
    return role === 'patient' ? '/portal' : '/agenda'
}

function parseSession(cookie: string | undefined): { role: UserRole } | null {
    if (!cookie) return null
    try {
        const decoded = Buffer.from(cookie, 'base64').toString('utf-8')
        return JSON.parse(decoded)
    } catch {
        return null
    }
}

function matchesRoute(pathname: string, routePrefix: string): boolean {
    return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`)
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    const sessionCookie = req.cookies.get('session')?.value
    const session = parseSession(sessionCookie)

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

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
