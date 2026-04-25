'use client'

import { useState, useMemo, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import {
    format,
    startOfWeek,
    addDays,
    isSameDay,
    parseISO,
    isToday,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
    Calendar,
    Clock,
    User,
    Stethoscope,
    MapPin,
    Plus,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

// Types
export type AppointmentStatus = 'arrived' | 'waiting' | 'missed'

export interface Appointment {
    id: string
    patientId: string
    patientName: string
    dentistId: string
    dentistName: string
    cubicleId: string
    cubicleName: string
    cubicleNumber: string
    startTime: string
    endTime: string
    status: AppointmentStatus
}

interface UseInfiniteAppointmentsResult {
    data?: {
        pages: Array<{
            appointments: Appointment[]
        }>
    }
    fetchNextPage: () => void
    hasNextPage: boolean
    isFetchingNextPage: boolean
    isLoading: boolean
}

// Mock hook - replace with your actual implementation
function useInfiniteAppointments(): UseInfiniteAppointmentsResult {
    // This is a placeholder - use your actual useInfiniteAppointments hook
    return {
        data: {
            pages: [
                {
                    appointments: generateMockAppointments(),
                },
            ],
        },
        fetchNextPage: () => {},
        hasNextPage: true,
        isFetchingNextPage: false,
        isLoading: false,
    }
}

// Generate mock data for demonstration
function generateMockAppointments(): Appointment[] {
    const statuses: AppointmentStatus[] = ['arrived', 'waiting', 'missed']
    const dentists = [
        { id: 'd1', name: 'Dr. García López' },
        { id: 'd2', name: 'Dra. Martínez Ruiz' },
        { id: 'd3', name: 'Dr. Sánchez Pérez' },
    ]
    const cubicles = [
        { id: 'c1', name: 'Cubículo A', number: '1' },
        { id: 'c2', name: 'Cubículo B', number: '2' },
        { id: 'c3', name: 'Cubículo C', number: '3' },
    ]
    const patients = [
        'Juan Pérez',
        'María González',
        'Carlos Rodríguez',
        'Ana Fernández',
        'Luis Hernández',
        'Laura Díaz',
        'Miguel Torres',
        'Carmen Ruiz',
        'José Moreno',
        'Isabel Jiménez',
    ]

    const appointments: Appointment[] = []
    const today = new Date()

    for (let day = 0; day < 7; day++) {
        const currentDate = addDays(today, day)
        const numAppointments = Math.floor(Math.random() * 5) + 3

        for (let i = 0; i < numAppointments; i++) {
            const hour = 8 + Math.floor(Math.random() * 10)
            const dentist =
                dentists[Math.floor(Math.random() * dentists.length)]
            const cubicle =
                cubicles[Math.floor(Math.random() * cubicles.length)]

            appointments.push({
                id: `apt-${day}-${i}`,
                patientId: `p${i}`,
                patientName:
                    patients[Math.floor(Math.random() * patients.length)],
                dentistId: dentist.id,
                dentistName: dentist.name,
                cubicleId: cubicle.id,
                cubicleName: cubicle.name,
                cubicleNumber: cubicle.number,
                startTime: new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate(),
                    hour,
                    0
                ).toISOString(),
                endTime: new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate(),
                    hour + 1,
                    0
                ).toISOString(),
                status: statuses[Math.floor(Math.random() * statuses.length)],
            })
        }
    }

    return appointments.sort(
        (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
}

// Status badge component
function StatusBadge({ status }: { status: AppointmentStatus }) {
    const statusConfig = {
        arrived: {
            label: 'Llegó',
            className:
                'bg-green-500 hover:bg-green-500 text-white border-green-500',
        },
        waiting: {
            label: 'Esperando',
            className:
                'bg-yellow-500 hover:bg-yellow-500 text-white border-yellow-500',
        },
        missed: {
            label: 'No asistió',
            className: 'bg-red-500 hover:bg-red-500 text-white border-red-500',
        },
    }

    const config = statusConfig[status]

    return (
        <Badge className={cn('text-xs font-medium', config.className)}>
            {config.label}
        </Badge>
    )
}

// Appointment card component
function AppointmentCard({ appointment }: { appointment: Appointment }) {
    return (
        <Card className="transition-shadow hover:shadow-md py-4 gap-3">
            <CardHeader className="pb-2 px-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="size-4" />
                        <span className="font-medium">
                            {format(parseISO(appointment.startTime), 'HH:mm')} -{' '}
                            {format(parseISO(appointment.endTime), 'HH:mm')}
                        </span>
                    </div>
                    <StatusBadge status={appointment.status} />
                </div>
            </CardHeader>
            <CardContent className="space-y-2 px-4">
                <div className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">
                        {appointment.patientName}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Stethoscope className="size-4 shrink-0" />
                    <span className="truncate">{appointment.dentistName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4 shrink-0" />
                    <span className="truncate">
                        {appointment.cubicleName} (#{appointment.cubicleNumber})
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}

// Loading skeleton
function AppointmentSkeleton() {
    return (
        <Card className="py-4 gap-3">
            <CardHeader className="pb-2 px-4">
                <div className="flex items-start justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-16" />
                </div>
            </CardHeader>
            <CardContent className="space-y-2 px-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-28" />
            </CardContent>
        </Card>
    )
}

// Doctor availability summary
function DoctorAvailability({ appointments }: { appointments: Appointment[] }) {
    const doctorStatus = useMemo(() => {
        const now = new Date()
        const doctorMap = new Map<
            string,
            { name: string; busy: boolean; cubicle: string | null }
        >()

        appointments.forEach((apt) => {
            const start = parseISO(apt.startTime)
            const end = parseISO(apt.endTime)
            const isBusy =
                now >= start && now <= end && apt.status === 'arrived'

            if (!doctorMap.has(apt.dentistId) || isBusy) {
                doctorMap.set(apt.dentistId, {
                    name: apt.dentistName,
                    busy: isBusy,
                    cubicle: isBusy ? apt.cubicleNumber : null,
                })
            }
        })

        return Array.from(doctorMap.values())
    }, [appointments])

    if (doctorStatus.length === 0) return null

    return (
        <div className="flex flex-wrap gap-2">
            {doctorStatus.map((doctor) => (
                <div
                    key={doctor.name}
                    className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border',
                        doctor.busy
                            ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300'
                            : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300'
                    )}
                >
                    <span
                        className={cn(
                            'size-2 rounded-full',
                            doctor.busy ? 'bg-red-500' : 'bg-green-500'
                        )}
                    />
                    <span className="font-medium">{doctor.name}</span>
                    {doctor.busy && doctor.cubicle && (
                        <span className="text-xs opacity-75">
                            (Cubículo #{doctor.cubicle})
                        </span>
                    )}
                </div>
            ))}
        </div>
    )
}

// Daily view component
function DailyView({
    appointments,
    selectedDate,
    onDateChange,
    isLoading,
    loadMoreRef,
    isFetchingNextPage,
}: {
    appointments: Appointment[]
    selectedDate: Date
    onDateChange: (date: Date) => void
    isLoading: boolean
    loadMoreRef: (node?: Element | null) => void
    isFetchingNextPage: boolean
}) {
    const filteredAppointments = useMemo(() => {
        return appointments.filter((apt) =>
            isSameDay(parseISO(apt.startTime), selectedDate)
        )
    }, [appointments, selectedDate])

    return (
        <div className="space-y-4">
            {/* Date navigation */}
            <div className="flex items-center justify-between gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDateChange(addDays(selectedDate, -1))}
                >
                    <ChevronLeft className="size-4" />
                </Button>
                <div className="text-center">
                    <p className="font-semibold text-lg">
                        {format(selectedDate, 'EEEE', { locale: es })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {format(selectedDate, "d 'de' MMMM, yyyy", {
                            locale: es,
                        })}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDateChange(addDays(selectedDate, 1))}
                >
                    <ChevronRight className="size-4" />
                </Button>
            </div>

            {/* Doctor availability */}
            <DoctorAvailability appointments={filteredAppointments} />

            {/* Appointments list */}
            <ScrollArea className="h-[calc(100vh-380px)] min-h-75">
                <div className="space-y-3 pr-4">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <AppointmentSkeleton key={i} />
                        ))
                    ) : filteredAppointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Calendar className="size-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                No hay citas para este día
                            </p>
                        </div>
                    ) : (
                        <>
                            {filteredAppointments.map((apt) => (
                                <AppointmentCard
                                    key={apt.id}
                                    appointment={apt}
                                />
                            ))}
                            {/* Infinite scroll trigger */}
                            <div ref={loadMoreRef} className="py-2">
                                {isFetchingNextPage && <AppointmentSkeleton />}
                            </div>
                        </>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}

// Weekly view component
function WeeklyView({
    appointments,
    selectedDate,
    onDateChange,
    isLoading,
    loadMoreRef,
    isFetchingNextPage,
}: {
    appointments: Appointment[]
    selectedDate: Date
    onDateChange: (date: Date) => void
    isLoading: boolean
    loadMoreRef: (node?: Element | null) => void
    isFetchingNextPage: boolean
}) {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    const appointmentsByDay = useMemo(() => {
        const byDay: Record<string, Appointment[]> = {}
        weekDays.forEach((day) => {
            const key = format(day, 'yyyy-MM-dd')
            byDay[key] = appointments.filter((apt) =>
                isSameDay(parseISO(apt.startTime), day)
            )
        })
        return byDay
    }, [appointments, weekDays])

    return (
        <div className="space-y-4">
            {/* Week navigation */}
            <div className="flex items-center justify-between gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDateChange(addDays(selectedDate, -7))}
                >
                    <ChevronLeft className="size-4" />
                </Button>
                <div className="text-center">
                    <p className="font-semibold">
                        {format(weekStart, 'd MMM', { locale: es })} -{' '}
                        {format(addDays(weekStart, 6), 'd MMM, yyyy', {
                            locale: es,
                        })}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDateChange(addDays(selectedDate, 7))}
                >
                    <ChevronRight className="size-4" />
                </Button>
            </div>

            {/* Doctor availability */}
            <DoctorAvailability appointments={appointments} />

            {/* Weekly grid - responsive */}
            <ScrollArea className="h-[calc(100vh-380px)] min-h-75">
                <div className="pr-4">
                    {/* Desktop: horizontal grid */}
                    <div className="hidden md:grid md:grid-cols-7 gap-2">
                        {weekDays.map((day) => {
                            const key = format(day, 'yyyy-MM-dd')
                            const dayAppointments = appointmentsByDay[key] || []
                            const dayIsToday = isToday(day)

                            return (
                                <div
                                    key={key}
                                    className={cn(
                                        'rounded-lg border p-2 min-h-50',
                                        dayIsToday &&
                                            'border-primary bg-primary/5'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'text-center pb-2 mb-2 border-b',
                                            dayIsToday &&
                                                'text-primary font-bold'
                                        )}
                                    >
                                        <p className="text-xs uppercase">
                                            {format(day, 'EEE', { locale: es })}
                                        </p>
                                        <p className="text-lg font-semibold">
                                            {format(day, 'd')}
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        {isLoading ? (
                                            <Skeleton className="h-16 w-full" />
                                        ) : dayAppointments.length === 0 ? (
                                            <p className="text-xs text-muted-foreground text-center py-4">
                                                Sin citas
                                            </p>
                                        ) : (
                                            dayAppointments
                                                .slice(0, 4)
                                                .map((apt) => (
                                                    <div
                                                        key={apt.id}
                                                        className="p-1.5 bg-muted rounded text-xs space-y-0.5"
                                                    >
                                                        <div className="flex items-center justify-between gap-1">
                                                            <span className="font-medium truncate">
                                                                {format(
                                                                    parseISO(
                                                                        apt.startTime
                                                                    ),
                                                                    'HH:mm'
                                                                )}
                                                            </span>
                                                            <StatusBadge
                                                                status={
                                                                    apt.status
                                                                }
                                                            />
                                                        </div>
                                                        <p className="truncate font-medium">
                                                            {apt.patientName}
                                                        </p>
                                                        <p className="truncate text-muted-foreground">
                                                            {apt.dentistName}
                                                        </p>
                                                        <p className="truncate text-muted-foreground">
                                                            Cub. #
                                                            {apt.cubicleNumber}
                                                        </p>
                                                    </div>
                                                ))
                                        )}
                                        {dayAppointments.length > 4 && (
                                            <p className="text-xs text-center text-muted-foreground">
                                                +{dayAppointments.length - 4}{' '}
                                                más
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Mobile: vertical list */}
                    <div className="md:hidden space-y-4">
                        {weekDays.map((day) => {
                            const key = format(day, 'yyyy-MM-dd')
                            const dayAppointments = appointmentsByDay[key] || []
                            const dayIsToday = isToday(day)

                            return (
                                <div
                                    key={key}
                                    className={cn(
                                        'rounded-lg border p-3',
                                        dayIsToday &&
                                            'border-primary bg-primary/5'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex items-center justify-between pb-2 mb-3 border-b',
                                            dayIsToday && 'text-primary'
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold">
                                                {format(day, 'd')}
                                            </span>
                                            <div>
                                                <p className="text-sm font-medium capitalize">
                                                    {format(day, 'EEEE', {
                                                        locale: es,
                                                    })}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(day, 'MMMM yyyy', {
                                                        locale: es,
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary">
                                            {dayAppointments.length} citas
                                        </Badge>
                                    </div>
                                    {isLoading ? (
                                        <AppointmentSkeleton />
                                    ) : dayAppointments.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No hay citas programadas
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {dayAppointments.map((apt) => (
                                                <AppointmentCard
                                                    key={apt.id}
                                                    appointment={apt}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        {/* Infinite scroll trigger */}
                        <div ref={loadMoreRef} className="py-2">
                            {isFetchingNextPage && <AppointmentSkeleton />}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}

// Main component
export function AppointmentAgenda() {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [view, setView] = useState<'daily' | 'weekly'>('daily')

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: '100px',
    })

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
        useInfiniteAppointments()

    // Fetch more when scrolling to bottom
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

    const appointments = useMemo(() => {
        return data?.pages.flatMap((page) => page.appointments) ?? []
    }, [data])

    return (
        <div className="w-full max-w-7xl mx-auto p-4 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Agenda de Citas</h1>
                    <p className="text-muted-foreground">
                        Gestiona las citas de tus pacientes
                    </p>
                </div>
                <Button className="w-full sm:w-auto">
                    <Plus className="size-4 mr-2" />
                    Nueva Cita
                </Button>
            </div>

            {/* Tabs for view switching */}
            <Tabs
                value={view}
                onValueChange={(v) => setView(v as 'daily' | 'weekly')}
            >
                <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="daily" className="flex-1 sm:flex-none">
                        <Calendar className="size-4 mr-2" />
                        Vista Diaria
                    </TabsTrigger>
                    <TabsTrigger value="weekly" className="flex-1 sm:flex-none">
                        <Calendar className="size-4 mr-2" />
                        Vista Semanal
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="daily" className="mt-4">
                    <DailyView
                        appointments={appointments}
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                        isLoading={isLoading}
                        loadMoreRef={loadMoreRef}
                        isFetchingNextPage={isFetchingNextPage}
                    />
                </TabsContent>

                <TabsContent value="weekly" className="mt-4">
                    <WeeklyView
                        appointments={appointments}
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                        isLoading={isLoading}
                        loadMoreRef={loadMoreRef}
                        isFetchingNextPage={isFetchingNextPage}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
