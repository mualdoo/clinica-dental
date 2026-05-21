'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { RegisterPayload, UserRole } from '@/types/auth'

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
    { value: 'dentist', label: 'Dentista' },
    { value: 'receptionist', label: 'Recepcionista' },
    { value: 'admin', label: 'Administrador' },
    { value: 'patient', label: 'Paciente' },
]

interface RegisterUserFormProps {
    // Fija un rol y oculta el selector — útil cuando el contexto ya lo define
    // (ej: en la página de doctores siempre es "dentist")
    fixedRole?: UserRole
    isLoading: boolean
    onSubmit: (data: RegisterPayload) => void
    onCancel?: () => void
    submitLabel?: string
}

const EMPTY: RegisterPayload = {
    email: '',
    name: '',
    lastName: '',
    role: 'dentist',
}

export function RegisterUserForm({
    fixedRole,
    isLoading,
    onSubmit,
    onCancel,
    submitLabel = 'Registrar',
}: RegisterUserFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterPayload>({
        defaultValues: {
            ...EMPTY,
            role: fixedRole ?? 'dentist',
        },
    })

    const [showPassword, setShowPw] = useState(false)

    function Field({
        id,
        label,
        required,
        error,
        children,
    }: {
        id: string
        label: string
        required?: boolean
        error?: string
        children: React.ReactNode
    }) {
        return (
            <div className="flex flex-col gap-1.5">
                <Label htmlFor={id}>
                    {label}
                    {required && (
                        <span className="text-destructive ml-0.5">*</span>
                    )}
                </Label>
                {children}
                {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
        )
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-4"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                    id="name"
                    label="Nombre"
                    required
                    error={errors.name?.message}
                >
                    <Input
                        id="name"
                        {...register('name', {
                            required: 'El nombre es requerido',
                            validate: (v) =>
                                v.trim() !== '' || 'El nombre es requerido',
                        })}
                        placeholder="Juan"
                        autoComplete="given-name"
                        className={errors.name ? 'border-destructive' : ''}
                    />
                </Field>

                <Field
                    id="lastName"
                    label="Apellido"
                    required
                    error={errors.lastName?.message}
                >
                    <Input
                        id="lastName"
                        {...register('lastName', {
                            required: 'El apellido es requerido',
                            validate: (v) =>
                                v.trim() !== '' || 'El apellido es requerido',
                        })}
                        placeholder="Pérez"
                        autoComplete="family-name"
                        className={errors.lastName ? 'border-destructive' : ''}
                    />
                </Field>
            </div>

            <Field
                id="email"
                label="Correo electrónico"
                required
                error={errors.email?.message}
            >
                <Input
                    id="email"
                    type="email"
                    {...register('email', {
                        required: 'El correo es requerido',
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Correo inválido',
                        },
                    })}
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                    className={errors.email ? 'border-destructive' : ''}
                />
            </Field>

            {/* Selector de rol — oculto si hay fixedRole */}
            {!fixedRole && (
                <Field id="role" label="Rol" required>
                    <select
                        id="role"
                        {...register('role')}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                        {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                </Field>
            )}

            <div className="flex gap-3 pt-1">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 gap-2"
                >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {submitLabel}
                </Button>
            </div>
        </form>
    )
}
