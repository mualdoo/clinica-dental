'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'

export function RegisterForm() {
    const { register, isLoading } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [values, setValues] = useState({
        name: '',
        lastName: '',
        email: '',
        password: '',
    })

    const set =
        (field: keyof typeof values) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setValues((v) => ({ ...v, [field]: e.target.value }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await register(values)
    }

    return (
        <Card className="w-full max-w-md animate-fade-in border-border/50 shadow-2xl">
            <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold">
                    Crear cuenta
                </CardTitle>
                <CardDescription>
                    Completa los datos para registrarte como paciente
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                placeholder="Juan"
                                required
                                autoComplete="given-name"
                                value={values.name}
                                onChange={set('name')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Apellido</Label>
                            <Input
                                id="lastName"
                                placeholder="Pérez"
                                required
                                autoComplete="family-name"
                                value={values.lastName}
                                onChange={set('lastName')}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="correo@ejemplo.com"
                            required
                            autoComplete="email"
                            value={values.email}
                            onChange={set('email')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Mínimo 8 caracteres"
                                required
                                minLength={8}
                                autoComplete="new-password"
                                value={values.password}
                                onChange={set('password')}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                tabIndex={-1}
                                aria-label={
                                    showPassword
                                        ? 'Ocultar contraseña'
                                        : 'Mostrar contraseña'
                                }
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creando cuenta…
                            </>
                        ) : (
                            'Crear cuenta'
                        )}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="justify-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?&nbsp;
                <Link
                    href="/login"
                    className="text-primary font-medium hover:underline"
                >
                    Inicia sesión
                </Link>
            </CardFooter>
        </Card>
    )
}
