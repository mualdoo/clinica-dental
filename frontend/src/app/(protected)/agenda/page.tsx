'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    User,
    MapPin,
    CalendarDays,
    Calendar,
    Plus,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useAppointments, useInfiniteAppointments } from '@/hooks/use-agenda'
import type { Appointment, AppointmentStatus } from '@/types/agenda'
import { AppointmentForm } from '@/components/agenda/AppointmentForm'

// ─── Helpers de fecha ─────────────────────────────────────────────────────────
function startOfWeek(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day // lunes como inicio
    d.setDate(d.getDate() + diff)
    d.setHours(0, 0, 0, 0)
    return d
}

function addDays(date: Date, n: number): Date {
    const d = new Date(date)
    d.setDate(d.getDate() + n)
    return d
}

function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })
}

function formatDateLong(date: Date): string {
    return date.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

function formatWeekRange(start: Date): string {
    const end = addDays(start, 6)
    const startStr = start.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
    })
    const endStr = end.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
    return `${startStr} — ${endStr}`
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MAX_WEEKLY = 4

// ─── Doctores hardcodeados ────────────────────────────────────────────────────
const DOCTORS = [
    { id: 'd1', name: 'Dra. García', free: true },
    { id: 'd2', name: 'Dr. Martínez', free: false },
    { id: 'd3', name: 'Dra. López', free: true },
    { id: 'd4', name: 'Dr. Hernández', free: true },
    { id: 'd5', name: 'Dra. Ramírez', free: false },
]

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
    AppointmentStatus,
    { label: string; className: string; dot: string }
> = {
    scheduled: {
        label: 'Programada',
        className: 'bg-sky-100    text-sky-700    border-sky-200',
        dot: 'bg-sky-500',
    },
    completed: {
        label: 'Completada',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
    },
    missed: {
        label: 'Faltó',
        className: 'bg-amber-100   text-amber-700   border-amber-200',
        dot: 'bg-amber-500',
    },
    cancelled: {
        label: 'Cancelada',
        className: 'bg-rose-100    text-rose-700    border-rose-200',
        dot: 'bg-rose-500',
    },
}

// ─── Componente Badge de estado ───────────────────────────────────────────────
function StatusBadge({
    status,
    mini = false,
}: {
    status: AppointmentStatus
    mini?: boolean
}) {
    const cfg = STATUS_CONFIG[status]
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.className}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {!mini && cfg.label}
        </span>
    )
}

function AgendaSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-6xl px-4 py-6 space-y-5">
                <div className="h-8 w-40 rounded-lg bg-muted animate-pulse" />
                <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-20 rounded-xl bg-muted animate-pulse"
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─── Tarjeta de cita — Vista Diaria ──────────────────────────────────────────
function AppointmentCard({ appt }: { appt: Appointment }) {
    return (
        <div className="group relative flex gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
            {/* Franja lateral de color según estado */}
            <div
                className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${STATUS_CONFIG[appt.status].dot}`}
            />
            <div className="ml-2 flex flex-col gap-1.5 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{appt.patientName}</span>
                    </div>
                    <StatusBadge status={appt.status} />
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(appt.startTime)} -{' '}
                        {formatTime(appt.endTime)}
                    </span>
                    <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {appt.Cubicle.name} - {appt.Cubicle.number}
                    </span>
                    <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Dr. {appt.dentistName}
                    </span>
                </div>
            </div>
        </div>
    )
}

// ─── Mini-tarjeta — Vista Semanal ─────────────────────────────────────────────
function MiniCard({ appt }: { appt: Appointment }) {
    return (
        <div className="rounded-lg border border-border/50 bg-card px-2 py-1.5 text-xs shadow-sm transition-colors hover:border-primary/30">
            <p className="font-medium text-foreground truncate">
                #{appt.patientId.slice(-6)}
            </p>
            <div className="flex items-center justify-between gap-1 mt-0.5">
                <span className="text-muted-foreground">
                    {formatTime(appt.startTime)}
                </span>
                <StatusBadge status={appt.status} mini />
            </div>
        </div>
    )
}

// ─── Vista Diaria ─────────────────────────────────────────────────────────────
function DailyView({
    appointments,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
}: {
    appointments: Appointment[]
    isLoading: boolean
    isFetchingNextPage: boolean
    hasNextPage: boolean
    fetchNextPage: () => void
}) {
    const loaderRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = loaderRef.current
        if (!el) return
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) fetchNextPage()
            },
            { threshold: 0.5 }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [hasNextPage, fetchNextPage])

    if (isLoading) return <DailySkeleton />

    if (!appointments.length)
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                <CalendarDays className="h-10 w-10 opacity-30" />
                <p className="text-sm">Sin citas para este día</p>
            </div>
        )

    return (
        <div className="flex flex-col gap-3">
            {appointments.map((appt) => (
                <AppointmentCard key={appt.id} appt={appt} />
            ))}
            <div
                ref={loaderRef}
                className="py-2 text-center text-xs text-muted-foreground"
            >
                {isFetchingNextPage && 'Cargando más citas…'}
            </div>
        </div>
    )
}

function DailySkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="h-20 rounded-xl border border-border/40 bg-muted/40 animate-pulse"
                />
            ))}
        </div>
    )
}

// ─── Vista Semanal ────────────────────────────────────────────────────────────
function WeeklyView({
    weekStart,
    appointments,
    isLoading,
}: {
    weekStart: Date
    appointments: Appointment[]
    isLoading: boolean
}) {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    const today = new Date()

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {days.map((day, i) => {
                const dayAppts = appointments.filter((a) =>
                    isSameDay(new Date(a.startTime), day)
                )
                const visible = dayAppts.slice(0, MAX_WEEKLY)
                const extra = dayAppts.length - MAX_WEEKLY
                const isToday = isSameDay(day, today)

                return (
                    <div
                        key={i}
                        className={`flex flex-col gap-1.5 rounded-xl border p-2 min-h-40 transition-colors
              ${isToday ? 'border-primary/40 bg-primary/5' : 'border-border/50 bg-card/50'}`}
                    >
                        {/* Encabezado del día */}
                        <div className="flex flex-col items-center pb-1 border-b border-border/40">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                {WEEK_DAYS[i]}
                            </span>
                            <span
                                className={`text-lg font-bold leading-tight
                  ${isToday ? 'text-primary' : 'text-foreground'}`}
                            >
                                {day.getDate()}
                            </span>
                        </div>

                        {/* Citas */}
                        {isLoading ? (
                            <div className="flex flex-col gap-1">
                                {Array.from({ length: 2 }).map((_, j) => (
                                    <div
                                        key={j}
                                        className="h-12 rounded-lg bg-muted/50 animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : visible.length === 0 ? (
                            <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
                                Sin citas
                            </p>
                        ) : (
                            <div className="flex flex-col gap-1 flex-1">
                                {visible.map((appt) => (
                                    <MiniCard key={appt.id} appt={appt} />
                                ))}
                                {extra > 0 && (
                                    <p className="text-[10px] font-medium text-muted-foreground text-center mt-0.5">
                                        +{extra} más
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function AgendaPage() {
    const [view, setView] = useState<'daily' | 'weekly'>('daily')
    const [currentDate, setDate] = useState<Date | null>(null)
    const [open, setOpen] = useState(false) // Lo moví arriba con los demás estados

    useEffect(() => {
        setDate(new Date())
    }, [])

    // 2. Cálculos de variables (con valores por defecto por si currentDate es null)
    const weekStart = currentDate ? startOfWeek(currentDate) : new Date()

    const startTime = currentDate
        ? view === 'daily'
            ? new Date(new Date(currentDate).setHours(0, 0, 0, 0)).toISOString()
            : weekStart.toISOString()
        : ''

    const endTime = currentDate
        ? view === 'daily'
            ? new Date(
                  new Date(currentDate).setHours(23, 59, 59, 999)
              ).toISOString()
            : addDays(weekStart, 6).toISOString()
        : ''

    // 3. El Hook de la Query siempre se llama, pero se "pausa" con enabled
    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useInfiniteAppointments({
            startTime,
            endTime,
            // IMPORTANTE: Solo se ejecuta si tenemos las fechas listas
            enabled: !!currentDate && !!startTime,
        })

    // 4. Memorización de funciones
    const navigate = useCallback(
        (dir: 1 | -1) => {
            if (!currentDate) return // Seguridad extra
            setDate((d) => addDays(d as Date, dir * (view === 'daily' ? 1 : 7)))
        },
        [view, currentDate] // Añadido currentDate a las dependencias
    )

    // 5. Preparación de datos para la UI
    const appointments: Appointment[] =
        data?.pages.flatMap((p) => p.data.data) ?? []

    const navLabel = currentDate
        ? view === 'daily'
            ? formatDateLong(currentDate)
            : formatWeekRange(weekStart)
        : ''

    // 6. AHORA SÍ, los retornos condicionales de UI van al final
    if (!currentDate || isLoading) {
        return <AgendaSkeleton />
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="mx-auto max-w-6xl w-full px-4 py-6 flex flex-col gap-5">
                {/* ── Encabezado ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Agenda
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Gestión de citas y disponibilidad
                        </p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> Nueva Cita
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-150">
                            <DialogHeader>
                                <DialogTitle>Agendar Nueva Cita</DialogTitle>
                                <DialogDescription>
                                    Completa los datos del paciente y asigna un
                                    doctor disponible.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Usamos el prop onCreated que definimos para cerrar el modal al terminar */}
                            <AppointmentForm onCreated={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>

                {/* ── Badges de doctores ── */}
                <div className="flex flex-wrap gap-2">
                    {DOCTORS.map((doc) => (
                        <Badge
                            key={doc.id}
                            variant="outline"
                            className="gap-1.5 px-3 py-1 text-xs font-medium"
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${doc.free ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            />
                            {doc.name}
                        </Badge>
                    ))}
                </div>

                {/* ── Tabs ── */}
                <Tabs
                    value={view}
                    onValueChange={(v) => setView(v as 'daily' | 'weekly')}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <TabsList className="w-fit" variant={'line'}>
                            <TabsTrigger value="daily" className="gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                Vista Diaria
                            </TabsTrigger>
                            <TabsTrigger value="weekly" className="gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" />
                                Vista Semanal
                            </TabsTrigger>
                        </TabsList>

                        {/* Navegación de fecha */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                aria-label="Anterior"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <span className="min-w-50 text-center text-sm font-medium text-foreground capitalize">
                                {navLabel}
                            </span>

                            <button
                                onClick={() => navigate(1)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                aria-label="Siguiente"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* ── Vista Diaria ── */}
                    <TabsContent value="daily" className="mt-4">
                        <DailyView
                            appointments={appointments}
                            isLoading={isLoading}
                            isFetchingNextPage={isFetchingNextPage}
                            hasNextPage={hasNextPage ?? false}
                            fetchNextPage={fetchNextPage}
                        />
                    </TabsContent>

                    {/* ── Vista Semanal ── */}
                    <TabsContent value="weekly" className="mt-4">
                        <WeeklyView
                            weekStart={weekStart}
                            appointments={appointments}
                            isLoading={isLoading}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
