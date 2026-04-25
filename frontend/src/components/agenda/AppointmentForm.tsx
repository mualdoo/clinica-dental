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
import { useCreateAppointment } from '@/hooks/use-agenda'
import { CubicleSelector } from './CubicleSelector'
import { SearchSelector } from '../SearchSelector'
import { useSearchPatients } from '@/hooks/use-patient'
import { Patient } from '@/types/patient'
import { User as UserType } from '@/types/auth'
import { useSearchDentists } from '@/hooks/use-auth'

// 1. Esquema de validación
const appointmentSchema = z.object({
    patientId: z.string().min(1, 'Selecciona un paciente'),
    dentistId: z.string().min(1, 'El doctor es obligatorio'),
    cubicleId: z.string().min(1, 'Asigna un cubículo'),
    date: z.date('Fecha requerida'),
    startTime: z.string().min(1, 'Hora de inicio requerida'),
    endTime: z.string().min(1, 'Hora de fin requerida'),
})

type AppointmentFormValues = z.infer<typeof appointmentSchema>

export function AppointmentForm({ onCreated }: { onCreated?: () => void }) {
    const { mutate: create, isPending } = useCreateAppointment()

    // 2. Inicialización del formulario
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
        defaultValues: { startTime: '09:00', endTime: '10:00' },
    })

    const selectedDate = watch('date')

    const onSubmit = (values: AppointmentFormValues) => {
        const dateStr = format(values.date, 'yyyy-MM-dd')
        create(
            {
                ...values,
                startTime: new Date(
                    `${dateStr}T${values.startTime}:00`
                ).toISOString(),
                endTime: new Date(
                    `${dateStr}T${values.endTime}:00`
                ).toISOString(),
                status: 'scheduled',
            },
            {
                onSuccess: () => {
                    reset()
                    onCreated?.()
                },
            }
        )
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

                {/* Dentro de tu formulario */}
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
            </div>

            <Button type="submit" className="w-full mt-4" disabled={isPending}>
                {isPending ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : (
                    'Confirmar Cita'
                )}
            </Button>
        </form>
    )
}
