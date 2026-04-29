'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/api/api-client'

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
    email: z.email('Correo inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type FormValues = z.infer<typeof schema>

// ─── Estados de la página ─────────────────────────────────────────────────────
type PageState = 'idle' | 'loading' | 'success' | 'error'

// ─── Página ───────────────────────────────────────────────────────────────────
export default function VerificarCuentaPage() {
    const router = useSearchParams()
    const navigate = useRouter()
    const token = router.get('token') ?? ''

    const [pageState, setPageState] = useState<PageState>('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const [showPw, setShowPw] = useState(false)

    // Si no hay token en la URL mostramos error inmediatamente
    useEffect(() => {
        if (!token) {
            setPageState('error')
            setErrorMsg('El enlace de verificación no es válido o ha expirado.')
        }
    }, [token])

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: '', password: '' },
    })

    async function onSubmit(values: FormValues) {
        setPageState('loading')
        setErrorMsg('')
        try {
            await apiClient('/auth/verify-patient-account', {
                method: 'POST',
                withAuth: false,
                body: JSON.stringify({
                    token: token,
                    email: values.email,
                    password: values.password,
                }),
            })
            setPageState('success')
        } catch (err: unknown) {
            setPageState('error')
            setErrorMsg(
                err instanceof Error
                    ? err.message
                    : 'No se pudo verificar la cuenta.'
            )
        }
    }

    // ── Success ────────────────────────────────────────────────────────────────
    if (pageState === 'success') {
        return (
            <AuthShell>
                <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <ShieldCheck className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl font-bold text-foreground">
                            ¡Cuenta verificada!
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Tu cuenta ha sido activada correctamente. Ya puedes
                            iniciar sesión.
                        </p>
                    </div>
                    <Button
                        className="w-full mt-2"
                        onClick={() => navigate.push('/auth/login')}
                    >
                        Ir a iniciar sesión
                    </Button>
                </div>
            </AuthShell>
        )
    }

    // ── Token inválido sin formulario ──────────────────────────────────────────
    if (pageState === 'error' && !token) {
        return (
            <AuthShell>
                <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
                        <AlertCircle className="h-8 w-8 text-rose-600" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl font-bold text-foreground">
                            Enlace inválido
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            El enlace de verificación no es válido o ha
                            expirado. Solicita uno nuevo.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => navigate.push('/auth/login')}
                    >
                        Volver al inicio
                    </Button>
                </div>
            </AuthShell>
        )
    }

    // ── Formulario ─────────────────────────────────────────────────────────────
    return (
        <AuthShell>
            <div className="flex flex-col gap-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                        <ShieldCheck className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            Verificar cuenta
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Ingresa tu correo y una contraseña para activar tu
                            cuenta
                        </p>
                    </div>
                </div>

                {/* Error del servidor */}
                {pageState === 'error' && errorMsg && (
                    <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800 px-3.5 py-3">
                        <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-rose-700 dark:text-rose-300">
                            {errorMsg}
                        </p>
                    </div>
                )}

                {/* Form */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-4"
                >
                    <div className="flex flex-col gap-2">
                        <Label
                            htmlFor="email"
                            className={errors.email ? 'text-destructive' : ''}
                        >
                            Correo electrónico
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="correo@ejemplo.com"
                            autoComplete="email"
                            {...register('email')}
                            className={
                                errors.email
                                    ? 'border-destructive focus-visible:ring-destructive'
                                    : ''
                            }
                        />
                        {errors.email && (
                            <p className="text-[0.8rem] font-medium text-destructive">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label
                            htmlFor="password"
                            className={
                                errors.password ? 'text-destructive' : ''
                            }
                        >
                            Contraseña
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPw ? 'text' : 'password'}
                                placeholder="Mínimo 8 caracteres"
                                autoComplete="new-password"
                                {...register('password')}
                                className={`pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPw((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPw ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-[0.8rem] font-medium text-destructive">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full gap-2 mt-1"
                        disabled={pageState === 'loading'}
                    >
                        {pageState === 'loading' && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Verificar cuenta
                    </Button>
                </form>
            </div>
        </AuthShell>
    )
}

// ─── Layout centrado reutilizable ─────────────────────────────────────────────
function AuthShell({ children }: { children: React.ReactNode }) {
    return (
        <main className="min-h-screen flex items-center justify-center from-sky-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
            <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                aria-hidden
            >
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-400/5 blur-3xl" />
            </div>
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/50 bg-card shadow-2xl p-8">
                {children}
            </div>
        </main>
    )
}
