'use client'

import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CreatePatientDto, Gender, BloodType } from '@/types/patient'

// ─── Opciones ─────────────────────────────────────────────────────────────────
const GENDERS: { value: Gender; label: string }[] = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' },
]

const BLOOD_TYPES: BloodType[] = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
]

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface PatientFormProps {
    initialValues?: Partial<CreatePatientDto>
    isLoading: boolean
    onSubmit: (data: CreatePatientDto) => void
    onCancel?: () => void
    submitLabel?: string
}

const EMPTY: CreatePatientDto = {
    email: '',
    name: '',
    lastName: '',
    birthDate: '',
    gender: 'M',
    phone: '',
    address: '',
    bloodType: 'O+',
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function PatientForm({
    initialValues,
    isLoading,
    onSubmit,
    onCancel,
    submitLabel = 'Registrar Paciente',
}: PatientFormProps) {
    // Inicializamos React Hook Form
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreatePatientDto>({
        defaultValues: {
            ...EMPTY,
            ...initialValues,
        },
    })

    // Observamos el valor actual del tipo de sangre para los botones personalizados
    const currentBloodType = watch('bloodType')

    // ── Helpers de campo ──────────────────────────────────────────────────────
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
                <Label htmlFor={id} className="text-sm font-medium">
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
            className="flex flex-col gap-6"
        >
            {/* ── Sección: Datos personales ── */}
            <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
                    Datos Personales
                </h2>

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
                            })}
                            placeholder="Pérez"
                            autoComplete="family-name"
                            className={
                                errors.lastName ? 'border-destructive' : ''
                            }
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                        id="birthDate"
                        label="Fecha de nacimiento"
                        required
                        error={errors.birthDate?.message}
                    >
                        <Input
                            id="birthDate"
                            type="date"
                            {...register('birthDate', {
                                required: 'La fecha de nacimiento es requerida',
                            })}
                            className={
                                errors.birthDate ? 'border-destructive' : ''
                            }
                        />
                    </Field>

                    <Field id="gender" label="Género" required>
                        <select
                            id="gender"
                            {...register('gender')}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            {GENDERS.map((g) => (
                                <option key={g.value} value={g.value}>
                                    {g.label}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                <Field id="bloodType" label="Tipo de sangre" required>
                    <div className="flex flex-wrap gap-2">
                        {BLOOD_TYPES.map((bt) => (
                            <button
                                key={bt}
                                type="button"
                                onClick={() =>
                                    setValue('bloodType', bt, {
                                        shouldValidate: true,
                                    })
                                }
                                className={`rounded-lg border px-3 py-1.5 text-sm font-mono font-semibold transition-all
                  ${
                      currentBloodType === bt
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                  }`}
                            >
                                {bt}
                            </button>
                        ))}
                    </div>
                </Field>
            </section>

            {/* ── Sección: Contacto ── */}
            <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
                    Contacto
                </h2>

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
                        readOnly={!!initialValues?.email}
                        className={`${errors.email ? 'border-destructive' : ''} ${initialValues?.email ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}`}
                    />
                </Field>

                <Field
                    id="phone"
                    label="Teléfono"
                    required
                    error={errors.phone?.message}
                >
                    <Input
                        id="phone"
                        type="tel"
                        {...register('phone', {
                            required: 'El teléfono es requerido',
                        })}
                        placeholder="222 123 4567"
                        autoComplete="tel"
                        className={errors.phone ? 'border-destructive' : ''}
                    />
                </Field>

                <Field id="address" label="Dirección">
                    <Input
                        id="address"
                        {...register('address')}
                        placeholder="Calle, número, colonia, ciudad"
                        autoComplete="street-address"
                    />
                </Field>
            </section>

            {/* ── Acciones ── */}
            <div className="flex gap-3 pt-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 sm:flex-none sm:w-32"
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 sm:flex-none sm:w-48 gap-2"
                >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {submitLabel}
                </Button>
            </div>
        </form>
    )
}
