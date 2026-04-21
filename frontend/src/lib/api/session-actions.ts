'use server'

import { cookies } from 'next/headers'
import type { User } from '@/types/auth'

const SESSION_COOKIE = 'session'
const MAX_AGE = 15 * 60

export async function createSessionCookie(user: User): Promise<void> {
    const payload = Buffer.from(
        JSON.stringify({ id: user.id, email: user.email, role: user.role })
    ).toString('base64')

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, payload, {
        httpOnly: false,
        sameSite: 'strict',
        maxAge: MAX_AGE,
        path: '/',
    })
}

export async function clearSessionCookie(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE)
}
