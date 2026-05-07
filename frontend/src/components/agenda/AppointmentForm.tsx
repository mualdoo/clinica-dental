'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

// Actualizado para usar usePatchAppointment
import { useCreateAppointment, usePatchAppointment } from '@/hooks/use-agenda'
import { CubicleSelector } from './CubicleSelector'
import { SearchSelector } from '../SearchSelector'
import { useSearchPatients } from '@/hooks/use-patient'
import { Patient } from '@/types/patient'
import { User as UserType } from '@/types/auth'
import { useSearchDentists } from '@/hooks/use-auth'

export type AppointmentStatus =
    | 'scheduled'
    | 'completed'
    | 'missed'
    | 'cancelled'

export const STATUS_CONFIG: Record<
    AppointmentStatus,
    { label: string; className: string; dot: string }
> = {
    scheduled: {
        label: 'Programada',
        className: 'bg-sky-100 text-sky-700 border-sky-200',
        dot: 'bg-sky-500',
    },
    completed: {
        label: 'Completada',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
    },
    missed: {
        label: 'Faltó',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
    },
    cancelled: {
        label: 'Cancelada',
        className: 'bg-rose-100 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
    },
}

const appointmentSchema = z.object({
    patientId: z.string().min(1, 'Selecciona un paciente'),
    dentistId: z.string().min(1, 'El doctor es obligatorio'),
    cubicleId: z.string().min(1, 'Asigna un cubículo'),
    date: z.date('Fecha requerida'),
    startTime: z.string().min(1, 'Hora de inicio requerida'),
    endTime: z.string().min(1, 'Hora de fin requerida'),
    status: z
        .enum(['scheduled', 'completed', 'missed', 'cancelled'])
        .optional(),
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>

export interface AppointmentInitialData {
    id: string
    patientId: string
    dentistId: string
    cubicleId: string
    startTime: string | Date
    endTime: string | Date
    status: AppointmentStatus
}

interface AppointmentFormProps {
    initialData?: AppointmentInitialData
    onSaved?: () => void
}

const extractTime = (dateValue: string | Date) => {
    const d = new Date(dateValue)
    return format(d, 'HH:mm')
}

export function AppointmentForm({
    initialData,
    onSaved,
}: AppointmentFormProps) {
    const isEditMode = !!initialData

    const { mutate: create, isPending: isCreating } = useCreateAppointment()
    // Renombrado para que coincida con tu hook
    const { mutate: patchAppointment, isPending: isUpdating } =
        usePatchAppointment()

    const isPending = isCreating || isUpdating

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset,
    } = useForm<AppointmentFormValues>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: initialData
            ? {
                  patientId: initialData.patientId,
                  dentistId: initialData.dentistId,
                  cubicleId: initialData.cubicleId,
                  status: initialData.status,
                  date: new Date(initialData.startTime),
                  startTime: extractTime(initialData.startTime),
                  endTime: extractTime(initialData.endTime),
              }
            : {
                  startTime: '09:00',
                  endTime: '10:00',
                  status: 'scheduled',
              },
    })

    const selectedDate = watch('date')

    const onSubmit = (values: AppointmentFormValues) => {
        const dateStr = format(values.date, 'yyyy-MM-dd')

        const payload = {
            patientId: values.patientId,
            dentistId: values.dentistId,
            cubicleId: values.cubicleId,
            status: values.status || 'scheduled',
            startTime: new Date(
                `${dateStr}T${values.startTime}:00`
            ).toISOString(),
            endTime: new Date(`${dateStr}T${values.endTime}:00`).toISOString(),
        }

        if (isEditMode && initialData) {
            // AQUÍ ESTÁ LA CORRECCIÓN: Separamos el 'id' del 'dto'
            patchAppointment(
                { id: initialData.id, dto: payload },
                {
                    onSuccess: () => {
                        reset()
                        onSaved?.()
                    },
                }
            )
        } else {
            create(payload, {
                onSuccess: () => {
                    reset()
                    onSaved?.()
                },
            })
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Paciente */}
                <div className="space-y-2">
                    <Label>Paciente</Label>
                    <SearchSelector<Patient>
                        placeholder="Buscar paciente..."
                        searchPlaceholder="Nombre, correo o tel..."
                        emptyMessage="No hay pacientes"
                        useSearchHook={useSearchPatients}
                        getDisplayValue={(p) => `${p.name} ${p.lastName}`}
                        onSelect={(id) => setValue('patientId', id)}
                        renderItem={(p) => (
                            <div className="flex flex-col">
                                <span>
                                    {p.name} {p.lastName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {p.email} - {p.phone}
                                </span>
                            </div>
                        )}
                    />
                </div>

                {/* Dentista */}
                <div className="space-y-2">
                    <Label>Dentista Responsable</Label>
                    <SearchSelector<UserType>
                        placeholder="Buscar dentista..."
                        searchPlaceholder="Nombre o correo"
                        emptyMessage="No hay dentistas"
                        useSearchHook={useSearchDentists}
                        getDisplayValue={(p) => `${p.name} ${p.lastName}`}
                        onSelect={(id) => setValue('dentistId', id)}
                        renderItem={(p) => (
                            <div className="flex flex-col">
                                <span>
                                    {p.name} {p.lastName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {p.email}
                                </span>
                            </div>
                        )}
                    />
                    {errors.dentistId && (
                        <p className="text-xs text-destructive">
                            {errors.dentistId.message}
                        </p>
                    )}
                </div>

                {/* Fecha con Calendario Popover */}
                <div className="space-y-2 flex flex-col">
                    <Label>Fecha de Consulta</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'justify-start text-left font-normal',
                                    !selectedDate && 'text-muted-foreground'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate
                                    ? format(selectedDate, 'PPP')
                                    : 'Seleccionar fecha'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(d) => d && setValue('date', d)}
                                disabled={(date) =>
                                    date <
                                    new Date(new Date().setHours(0, 0, 0, 0))
                                }
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.date && (
                        <p className="text-xs text-destructive">
                            {errors.date.message}
                        </p>
                    )}
                </div>

                {/* Cubículo */}
                <div className="space-y-2">
                    <Label>Cubículo / Sala</Label>
                    <Controller
                        control={control}
                        name="cubicleId"
                        render={({ field }) => (
                            <CubicleSelector
                                value={field.value}
                                onValueChange={field.onChange}
                            />
                        )}
                    />
                    {errors.cubicleId && (
                        <p className="text-xs text-destructive">
                            {errors.cubicleId.message}
                        </p>
                    )}
                </div>

                {/* Horarios */}
                <div className="space-y-2">
                    <Label>Hora Inicio</Label>
                    <Input type="time" {...register('startTime')} />
                </div>
                <div className="space-y-2">
                    <Label>Hora Fin</Label>
                    <Input type="time" {...register('endTime')} />
                </div>

                {/* Selector de Estado (Solo Edición) */}
                {isEditMode && initialData && (
                    <div className="space-y-2 md:col-span-2">
                        <Label>Estado de la Cita</Label>
                        <Controller
                            control={control}
                            name="status"
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={
                                        initialData.status !== 'scheduled'
                                    }
                                >
                                    <SelectTrigger className="w-full md:w-1/2">
                                        <SelectValue placeholder="Selecciona un estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(
                                            Object.keys(
                                                STATUS_CONFIG
                                            ) as AppointmentStatus[]
                                        ).map((key) => (
                                            <SelectItem key={key} value={key}>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={cn(
                                                            'w-2 h-2 rounded-full',
                                                            STATUS_CONFIG[key]
                                                                .dot
                                                        )}
                                                    />
                                                    {STATUS_CONFIG[key].label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {initialData.status !== 'scheduled' && (
                            <p className="text-xs text-muted-foreground mt-1">
                                No se puede cambiar el estado de una cita que ya
                                fue{' '}
                                {STATUS_CONFIG[
                                    initialData.status
                                ].label.toLowerCase()}
                                .
                            </p>
                        )}
                    </div>
                )}
            </div>

            <Button type="submit" className="w-full mt-4" disabled={isPending}>
                {isPending ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : isEditMode ? (
                    'Guardar Cambios'
                ) : (
                    'Confirmar Cita'
                )}
            </Button>
        </form>
    )
}
