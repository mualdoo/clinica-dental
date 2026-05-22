'use client'

import { useState, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    format,
    addMinutes,
    differenceInMinutes,
    startOfDay,
    endOfDay,
} from 'date-fns'
import { CalendarIcon, Loader2, Clock } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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

import {
    useCreateAppointment,
    usePatchAppointment,
    useAppointments,
} from '@/hooks/use-agenda'
import type {
    Appointment,
    AppointmentStatus,
    CreateAppointmentDto,
} from '@/types/agenda'

import { CubicleSelector } from './CubicleSelector'
import { SearchSelector } from '../SearchSelector'
import { useSearchPatients } from '@/hooks/use-patient'
import { useSearchDentists } from '@/hooks/use-auth'
import { Patient } from '@/types/patient'
import { User as UserType } from '@/types/auth'

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
        className: 'bg-rose-100 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
    },
    cancelled: {
        label: 'Cancelada',
        className: 'bg-rose-100 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
    },
    ongoing: {
        label: 'En curso',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
    },
}

const appointmentSchema = z.object({
    patientId: z.string().min(1, 'Selecciona un paciente'),
    dentistId: z.string().min(1, 'El doctor es obligatorio'),
    cubicleId: z.string().min(1, 'Asigna un cubículo'),
    date: z.date('Fecha requerida'),
    duration: z.enum(['30', '60']),
    startTime: z.string().min(1, 'Hora de inicio requerida'),
    status: z
        .enum(['scheduled', 'completed', 'missed', 'cancelled', 'ongoing'])
        .optional(),
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>

interface AppointmentFormProps {
    initialData?: Appointment
    onSaved?: () => void
}

const extractTime = (dateValue: string | Date) => {
    return format(new Date(dateValue), 'HH:mm')
}

export function AppointmentForm({
    initialData,
    onSaved,
}: AppointmentFormProps) {
    const isEditMode = !!initialData

    const { mutate: create, isPending: isCreating } = useCreateAppointment()
    const { mutate: patchAppointment, isPending: isUpdating } =
        usePatchAppointment()

    const isPending = isCreating || isUpdating
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)

    // Calculamos la duración inicial si estamos en modo edición
    const initialDuration = initialData
        ? String(
              differenceInMinutes(
                  new Date(initialData.endTime),
                  new Date(initialData.startTime)
              )
          )
        : '30'

    const {
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
                  duration: (initialDuration === '60' ? '60' : '30') as
                      | '30'
                      | '60',
                  startTime: extractTime(initialData.startTime),
              }
            : {
                  duration: '30',
                  status: 'scheduled',
              },
    })

    const selectedDate = watch('date')
    const selectedCubicle = watch('cubicleId')
    const selectedDuration = watch('duration')

    // ─── CONSULTA DINÁMICA DE DISPONIBILIDAD ─────────────────────────────
    const queryStartTime = selectedDate
        ? startOfDay(selectedDate).toISOString()
        : undefined
    const queryEndTime = selectedDate
        ? endOfDay(selectedDate).toISOString()
        : undefined

    const { data: agendaData, isLoading: isLoadingDispo } = useAppointments({
        cubicleId: selectedCubicle,
        startTime: queryStartTime,
        endTime: queryEndTime,
        // Solo hace la petición si ya tenemos cubículo y fecha seleccionados
        enabled: !!(selectedDate && selectedCubicle),
    })

    // Extraemos el arreglo de citas basado en PaginatedResponse
    // Ajusta la cadena de acceso (data.data.data) si tu hook retorna el objeto diferente
    const formAppointments: Appointment[] = agendaData?.data?.data || []

    // ─── LÓGICA DE HORARIOS (8 AM a 8 PM) ────────────────────────────────
    const availableSlots = useMemo(() => {
        if (!selectedDate || !selectedCubicle || isLoadingDispo) return []

        const slots: { time: string; isOccupied: boolean }[] = []

        const now = new Date()
        const isToday = selectedDate.toDateString() === now.toDateString()

        let current = new Date(selectedDate)
        current.setHours(8, 0, 0, 0) // 08:00 AM

        if (isToday && selectedDate < now) {
            // Redondeo al alza a los siguientes 30 minutos
            // Obtenemos los minutos actuales y calculamos cuánto falta para el siguiente bloque de 30
            const minutes = now.getMinutes()
            const nextHalfHour = minutes < 30 ? 30 : 60

            current.setHours(now.getHours())
            current.setMinutes(nextHalfHour === 60 ? 0 : 30)

            // Si fueron 60 minutos (la siguiente hora), aumentamos la hora
            if (nextHalfHour === 60) {
                current.setHours(now.getHours() + 1)
            }

            // Aseguramos que no se pase de las horas de trabajo (opcional)
            current.setSeconds(0, 0)
        }

        const endOfDayLimit = new Date(selectedDate)
        endOfDayLimit.setHours(18, 0, 0, 0) // 18:00 PM

        const durationMins = parseInt(selectedDuration)

        while (current < endOfDayLimit) {
            const slotStart = current
            const slotEnd = addMinutes(slotStart, durationMins)

            // Si la duración hace que la cita termine después de las 8 PM, terminamos
            if (slotEnd > endOfDayLimit) {
                break
            }

            // Verificamos solapamiento
            const isOccupied = formAppointments.some((appt) => {
                // Si estamos editando, ignoramos la cita actual para que el usuario pueda conservar su horario
                if (appt.id === initialData?.id) return false

                const apptStart = new Date(appt.startTime)
                const apptEnd = new Date(appt.endTime)

                return apptStart < slotEnd && apptEnd > slotStart
            })

            slots.push({
                time: format(current, 'HH:mm'),
                isOccupied: isOccupied,
            })

            // Avanzamos en bloques de 30 minutos
            current = addMinutes(current, 30)
        }

        return slots
    }, [
        selectedDate,
        selectedCubicle,
        selectedDuration,
        formAppointments,
        initialData,
        isLoadingDispo,
    ])

    // ─── SUBMIT ──────────────────────────────────────────────────────────
    const onSubmit = (values: AppointmentFormValues) => {
        const dateStr = format(values.date, 'yyyy-MM-dd')
        const startTimeDate = new Date(`${dateStr}T${values.startTime}:00`)
        const endTimeDate = addMinutes(startTimeDate, parseInt(values.duration))

        const payload: CreateAppointmentDto = {
            patientId: values.patientId,
            dentistId: values.dentistId,
            cubicleId: values.cubicleId,
            status: values.status || 'scheduled',
            startTime: startTimeDate.toISOString(),
            endTime: endTimeDate.toISOString(),
        }

        if (isEditMode && initialData) {
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
        <div className="w-full max-w-5xl mx-auto p-6 md:p-8 bg-background border rounded-xl shadow-sm">
            <div className="mb-8">
                <h2 className="text-2xl font-semibold tracking-tight">
                    {isEditMode ? 'Editar Cita' : 'Agendar Nueva Cita'}
                </h2>
                <p className="text-muted-foreground mt-1">
                    Completa los detalles para asignar un espacio al paciente.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* COLUMNA 1: Información de Personas y Cubículo */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>Paciente</Label>
                            <SearchSelector<Patient>
                                placeholder="Buscar paciente..."
                                searchPlaceholder="Nombre, correo o tel..."
                                emptyMessage="No hay pacientes"
                                useSearchHook={useSearchPatients}
                                getDisplayValue={(p) =>
                                    `${p.name} ${p.lastName}`
                                }
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
                            {errors.patientId && (
                                <p className="text-xs text-destructive">
                                    {errors.patientId.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Dentista Responsable</Label>
                            <SearchSelector<UserType>
                                placeholder="Buscar dentista..."
                                searchPlaceholder="Nombre o correo"
                                emptyMessage="No hay dentistas"
                                useSearchHook={useSearchDentists}
                                getDisplayValue={(p) =>
                                    `${p.name} ${p.lastName}`
                                }
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

                        <div className="space-y-2">
                            <Label>Cubículo / Sala</Label>
                            <Controller
                                control={control}
                                name="cubicleId"
                                render={({ field }) => (
                                    <CubicleSelector
                                        value={field.value}
                                        onValueChange={(val) => {
                                            field.onChange(val)
                                            // Limpiamos la hora si se cambia el cubículo
                                            setValue('startTime', '')
                                        }}
                                    />
                                )}
                            />
                            {errors.cubicleId && (
                                <p className="text-xs text-destructive">
                                    {errors.cubicleId.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* COLUMNA 2: Tiempos y Fechas */}
                    <div className="space-y-6 p-6 rounded-lg">
                        <div className="space-y-2 flex flex-col">
                            <Label>Fecha de Consulta</Label>
                            <Popover
                                open={isCalendarOpen}
                                onOpenChange={setIsCalendarOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'justify-start text-left font-normal bg-white',
                                            !selectedDate &&
                                                'text-muted-foreground'
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
                                        onSelect={(d) => {
                                            if (d) {
                                                setValue('date', d)
                                                setIsCalendarOpen(false) // Cierra el popover al seleccionar
                                                setValue('startTime', '') // Limpiamos la hora para forzar re-selección
                                            }
                                        }}
                                        disabled={(date) =>
                                            date <
                                            new Date(
                                                new Date().setHours(0, 0, 0, 0)
                                            )
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

                        <div className="grid grid-cols-2 gap-4">
                            {/* Duración */}
                            <div className="space-y-2">
                                <Label>Duración</Label>
                                <Controller
                                    control={control}
                                    name="duration"
                                    render={({ field }) => (
                                        <Select
                                            disabled={
                                                !selectedCubicle ||
                                                !selectedDate
                                            }
                                            onValueChange={(val) => {
                                                field.onChange(val)
                                                setValue('startTime', '') // Resetear la hora al cambiar duración
                                            }}
                                            value={field.value}
                                        >
                                            <SelectTrigger className="bg-white">
                                                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                                                <SelectValue placeholder="Selecciona..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="30">
                                                    30 Minutos
                                                </SelectItem>
                                                <SelectItem value="60">
                                                    1 Hora
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            {/* Hora de Inicio (Lista de disponibilidad) */}
                            <div className="space-y-2">
                                <Label>Hora de Inicio</Label>
                                <Controller
                                    control={control}
                                    name="startTime"
                                    render={({ field }) => (
                                        <Select
                                            disabled={
                                                !selectedCubicle ||
                                                !selectedDate ||
                                                isLoadingDispo
                                            }
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger className="bg-white">
                                                {isLoadingDispo ? (
                                                    <div className="flex items-center text-muted-foreground">
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        <span>Cargando...</span>
                                                    </div>
                                                ) : (
                                                    <SelectValue placeholder="Elige un horario" />
                                                )}
                                            </SelectTrigger>
                                            <SelectContent className="max-h-60">
                                                {availableSlots.length === 0 &&
                                                !isLoadingDispo ? (
                                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                                        Selecciona fecha y
                                                        cubículo
                                                    </div>
                                                ) : (
                                                    availableSlots.map(
                                                        (slot) => (
                                                            <SelectItem
                                                                key={slot.time}
                                                                value={
                                                                    slot.time
                                                                }
                                                                disabled={
                                                                    slot.isOccupied
                                                                }
                                                            >
                                                                {slot.time}{' '}
                                                                {slot.isOccupied &&
                                                                    '(Ocupado)'}
                                                            </SelectItem>
                                                        )
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.startTime && (
                                    <p className="text-xs text-destructive">
                                        {errors.startTime.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Selector de Estado (Solo Edición) */}
                        {isEditMode && initialData && (
                            <div className="space-y-2 pt-4 border-t">
                                <Label>Estado de la Cita</Label>
                                <Controller
                                    control={control}
                                    name="status"
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={
                                                initialData.status !==
                                                'scheduled'
                                            }
                                        >
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Selecciona un estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(
                                                    Object.keys(
                                                        STATUS_CONFIG
                                                    ) as AppointmentStatus[]
                                                ).map((key) => (
                                                    <SelectItem
                                                        key={key}
                                                        value={key}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className={cn(
                                                                    'w-2 h-2 rounded-full',
                                                                    STATUS_CONFIG[
                                                                        key
                                                                    ].dot
                                                                )}
                                                            />
                                                            {
                                                                STATUS_CONFIG[
                                                                    key
                                                                ].label
                                                            }
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {initialData.status !== 'scheduled' && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        No se puede cambiar el estado de una
                                        cita que ya fue{' '}
                                        {STATUS_CONFIG[
                                            initialData.status
                                        ].label.toLowerCase()}
                                        .
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t">
                    <Button
                        type="submit"
                        size="lg"
                        disabled={isPending}
                        className="w-full md:w-auto px-10"
                    >
                        {isPending ? (
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        ) : isEditMode ? (
                            'Guardar Cambios'
                        ) : (
                            'Confirmar Cita'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
