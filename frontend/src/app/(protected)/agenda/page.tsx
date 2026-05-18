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
    MoreVertical,
    CheckCircle2,
    XCircle,
    Pencil,
    Trash2,
    Filter,
    X,
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
    useInfiniteAppointments,
    usePatchAppointment,
    useDeleteAppointment,
} from '@/hooks/use-agenda'
import type { Appointment, AppointmentStatus } from '@/types/agenda'
import { DentistStatusBadges } from '@/components/agenda/dentist-status-badges'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

// ─── Imports para los filtros ────────────────────────────────────────────────
import { useSearchPatients } from '@/hooks/use-patient'
import { useSearchDentists } from '@/hooks/use-auth'
import { Patient } from '@/types/patient'
import { User as UserType } from '@/types/auth'
import { SearchSelector } from '@/components/SearchSelector'
import { CubicleSelector } from '@/components/agenda/CubicleSelector'

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

// ─── Status config ────────────────────────────────────────────────────────────
// Se agregó 'ongoing' (En curso)
const STATUS_CONFIG: Record<
    AppointmentStatus | 'ongoing',
    { label: string; className: string; dot: string }
> = {
    ongoing: {
        label: 'En curso',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
    },
    completed: {
        label: 'Completada',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
    },
    scheduled: {
        label: 'Programada',
        className: 'bg-sky-100 text-sky-700 border-sky-200',
        dot: 'bg-sky-500',
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
}

// ─── Helper Dinámico para "En espera" ─────────────────────────────────────────
function getDisplayStatus(appt: Appointment) {
    console.log(new Date(appt.startTime), 'ayudaaaa', new Date())
    if (appt.status === 'scheduled' && new Date() > new Date(appt.startTime)) {
        return {
            label: 'En espera',
            className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            dot: 'bg-yellow-500',
        }
    }
    return STATUS_CONFIG[appt.status] || STATUS_CONFIG['scheduled']
}

// ─── Componente Badge de estado ───────────────────────────────────────────────
function StatusBadge({
    appt,
    mini = false,
}: {
    appt: Appointment
    mini?: boolean
}) {
    const cfg = getDisplayStatus(appt)
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

// ─── Tarjeta de cita ─────────────────────────────────────────────────────────
function AppointmentCard({ appt }: { appt: Appointment }) {
    const { mutate: patch } = usePatchAppointment()
    const { mutate: remove } = useDeleteAppointment()
    const router = useRouter()

    const displayStatus = getDisplayStatus(appt)

    return (
        <>
            <div className="group relative flex gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
                <div
                    className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${displayStatus.dot}`}
                />

                <div className="ml-2 flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{appt.patientName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusBadge appt={appt} />

                            {/* ── Menú de acciones ── */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-44"
                                >
                                    {/* En lugar de Marcar completada -> Paciente llegó (ongoing) */}
                                    {appt.status === 'scheduled' && (
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer text-blue-600 focus:text-blue-600 focus:bg-blue-50"
                                            onClick={() =>
                                                patch({
                                                    id: appt.id,
                                                    dto: {
                                                        status: 'ongoing' as any,
                                                    }, // Casteo por si TypeScript reclama
                                                })
                                            }
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Paciente llegó
                                        </DropdownMenuItem>
                                    )}

                                    {/* Si está en curso, permitir completarla */}
                                    {appt.status === ('ongoing' as any) && (
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"
                                            onClick={() =>
                                                patch({
                                                    id: appt.id,
                                                    dto: {
                                                        status: 'completed',
                                                    },
                                                })
                                            }
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Marcar completada
                                        </DropdownMenuItem>
                                    )}

                                    {/* Cancelar (Si está programada o en curso) */}
                                    {(appt.status === 'scheduled' ||
                                        appt.status === ('ongoing' as any)) && (
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                                            onClick={() =>
                                                patch({
                                                    id: appt.id,
                                                    dto: {
                                                        status: 'cancelled',
                                                    },
                                                })
                                            }
                                        >
                                            <XCircle className="h-3.5 w-3.5" />
                                            Cancelar cita
                                        </DropdownMenuItem>
                                    )}

                                    {/* Faltó (Si está programada) */}
                                    {appt.status === 'scheduled' && (
                                        <DropdownMenuItem
                                            className="gap-2 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                                            onClick={() =>
                                                patch({
                                                    id: appt.id,
                                                    dto: { status: 'missed' },
                                                })
                                            }
                                        >
                                            <XCircle className="h-3.5 w-3.5" />
                                            Marcar inasistencia
                                        </DropdownMenuItem>
                                    )}

                                    {/* ACCIÓN DE EDITAR */}
                                    <DropdownMenuItem
                                        className="gap-2 cursor-pointer"
                                        onSelect={() =>
                                            router.push(
                                                `/agenda/${appt.id}/editar`
                                            )
                                        }
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Editar
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                        onClick={() => {
                                            if (confirm('¿Eliminar esta cita?'))
                                                remove(appt.id)
                                        }}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Eliminar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(appt.startTime)} –{' '}
                            {formatTime(appt.endTime)}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Cubículo #{appt.Cubicle?.number} ·{' '}
                            {appt.Cubicle?.name}
                        </span>
                        <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Dr. {appt.dentistName}
                        </span>
                    </div>
                </div>
            </div>
        </>
    )
}

// ─── Mini-tarjeta — Vista Semanal ─────────────────────────────────────────────
function MiniCard({ appt }: { appt: Appointment }) {
    return (
        <div className="rounded-lg border border-border/50 bg-card px-2 py-1.5 text-xs shadow-sm transition-colors hover:border-primary/30">
            <p className="font-medium text-foreground truncate">
                {appt.patientName || appt.patientId.slice(-6)}
            </p>
            <div className="flex items-center justify-between gap-1 mt-0.5">
                <span className="text-muted-foreground">
                    {formatTime(appt.startTime)}
                </span>
                <StatusBadge appt={appt} mini />
            </div>
        </div>
    )
}

// ─── Vistas (Diaria / Filtrada / Semanal) ────────────────────────────────────
function ListView({
    appointments,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    emptyMessage = 'Sin citas para mostrar',
}: {
    appointments: Appointment[]
    isLoading: boolean
    isFetchingNextPage: boolean
    hasNextPage: boolean
    fetchNextPage: () => void
    emptyMessage?: string
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
                <p className="text-sm">{emptyMessage}</p>
            </div>
        )

    return (
        <div className="flex flex-col gap-3 mt-4">
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
        <div className="flex flex-col gap-3 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="h-24 rounded-xl border border-border/40 bg-muted/40 animate-pulse"
                />
            ))}
        </div>
    )
}

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
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-4">
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
                        <div className="flex flex-col items-center pb-1 border-b border-border/40">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                {WEEK_DAYS[i]}
                            </span>
                            <span
                                className={`text-lg font-bold leading-tight ${isToday ? 'text-primary' : 'text-foreground'}`}
                            >
                                {day.getDate()}
                            </span>
                        </div>

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
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    // ─── Filtros activos desde la URL ───
    const urlPatientId = searchParams.get('patientId') || undefined
    const urlDentistId = searchParams.get('dentistId') || undefined
    const urlCubicleId = searchParams.get('cubicleId') || undefined
    const urlStatus = searchParams.get('status') as
        | AppointmentStatus
        | 'ongoing'
        | undefined
    const urlStartTime = searchParams.get('startTime') || undefined
    const urlEndTime = searchParams.get('endTime') || undefined

    const hasFilters = !!(
        urlPatientId ||
        urlDentistId ||
        urlCubicleId ||
        urlStatus ||
        urlStartTime ||
        urlEndTime
    )

    // ─── Estados locales para el Popover de filtros ───
    const [formPatientId, setFormPatientId] = useState(urlPatientId || '')
    const [formDentistId, setFormDentistId] = useState(urlDentistId || '')
    const [formCubicleId, setFormCubicleId] = useState(urlCubicleId || '')
    const [formStatus, setFormStatus] = useState(urlStatus || '')
    const [formStartTime, setFormStartTime] = useState(
        urlStartTime ? urlStartTime.split('T')[0] : ''
    )
    const [formEndTime, setFormEndTime] = useState(
        urlEndTime ? urlEndTime.split('T')[0] : ''
    )

    useEffect(() => {
        setDate(new Date())
    }, [])

    const weekStart = currentDate ? startOfWeek(currentDate) : new Date()

    // Si hay filtros, usamos las fechas de los filtros, si no, usamos el rango de la pestaña (Diaria/Semanal)
    const queryStartTime = hasFilters
        ? urlStartTime
        : currentDate
          ? view === 'daily'
              ? new Date(
                    new Date(currentDate).setHours(0, 0, 0, 0)
                ).toISOString()
              : weekStart.toISOString()
          : ''

    const queryEndTime = hasFilters
        ? urlEndTime
        : currentDate
          ? view === 'daily'
              ? new Date(
                    new Date(currentDate).setHours(23, 59, 59, 999)
                ).toISOString()
              : addDays(weekStart, 7).toISOString()
          : ''

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useInfiniteAppointments({
            patientId: urlPatientId,
            dentistId: urlDentistId,
            cubicleId: urlCubicleId,
            status: urlStatus,
            startTime: queryStartTime,
            endTime: queryEndTime,
            enabled: hasFilters ? true : !!currentDate && !!queryStartTime,
        })

    const navigate = useCallback(
        (dir: 1 | -1) => {
            if (!currentDate) return
            setDate((d) => addDays(d as Date, dir * (view === 'daily' ? 1 : 7)))
        },
        [view, currentDate]
    )

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString())

        if (formPatientId) params.set('patientId', formPatientId)
        else params.delete('patientId')

        if (formDentistId) params.set('dentistId', formDentistId)
        else params.delete('dentistId')

        if (formCubicleId) params.set('cubicleId', formCubicleId)
        else params.delete('cubicleId')

        // Corregido: para que si eligen 'none', se quite el filtro
        if (formStatus && formStatus !== 'none')
            params.set('status', formStatus)
        else params.delete('status')

        if (formStartTime) {
            params.set(
                'startTime',
                new Date(`${formStartTime}T00:00:00`).toISOString()
            )
        } else {
            params.delete('startTime')
        }

        if (formEndTime) {
            params.set(
                'endTime',
                new Date(`${formEndTime}T23:59:59.999`).toISOString()
            )
        } else {
            params.delete('endTime')
        }

        setIsFilterOpen(false)
        router.push(`${pathname}?${params.toString()}`)
    }

    const clearFilters = () => {
        setFormPatientId('')
        setFormDentistId('')
        setFormCubicleId('')
        setFormStatus('')
        setFormStartTime('')
        setFormEndTime('')
        setIsFilterOpen(false)
        router.push(pathname)
    }

    const appointments: Appointment[] =
        data?.pages.flatMap((p) => p.data.data) ?? []

    const navLabel = currentDate
        ? view === 'daily'
            ? formatDateLong(currentDate)
            : formatWeekRange(weekStart)
        : ''

    if (!currentDate || (isLoading && !hasFilters)) {
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

                    <div className="flex items-center gap-2">
                        {/* ── Popover de Filtros ── */}
                        <Popover
                            open={isFilterOpen}
                            onOpenChange={setIsFilterOpen}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={
                                        hasFilters
                                            ? 'bg-primary/10 border-primary/20 text-primary'
                                            : 'gap-2'
                                    }
                                >
                                    <Filter className="h-4 w-4" />
                                    {hasFilters ? 'Filtros Activos' : 'Filtrar'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                align="end"
                                className="w-80 p-4 space-y-4"
                            >
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">
                                        Filtros de Búsqueda
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        Busca citas específicas sin importar la
                                        fecha.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">
                                            Paciente
                                        </Label>
                                        <SearchSelector<Patient>
                                            placeholder="Todos los pacientes"
                                            searchPlaceholder="Buscar..."
                                            emptyMessage="No encontrado"
                                            useSearchHook={useSearchPatients}
                                            getDisplayValue={(p) =>
                                                `${p.name} ${p.lastName}`
                                            }
                                            onSelect={(id) =>
                                                setFormPatientId(id)
                                            }
                                            renderItem={(p) => (
                                                <div className="flex flex-col">
                                                    <span>
                                                        {p.name} {p.lastName}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {p.email}
                                                    </span>
                                                </div>
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">
                                            Dentista
                                        </Label>
                                        <SearchSelector<UserType>
                                            placeholder="Todos los dentistas"
                                            searchPlaceholder="Buscar..."
                                            emptyMessage="No encontrado"
                                            useSearchHook={useSearchDentists}
                                            getDisplayValue={(p) =>
                                                `${p.name} ${p.lastName}`
                                            }
                                            onSelect={(id) =>
                                                setFormDentistId(id)
                                            }
                                            renderItem={(p) => (
                                                <div className="flex flex-col">
                                                    <span>
                                                        {p.name} {p.lastName}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {p.email}
                                                    </span>
                                                </div>
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">
                                            Cubículo
                                        </Label>
                                        <CubicleSelector
                                            value={formCubicleId}
                                            onValueChange={(val) =>
                                                setFormCubicleId(val)
                                            }
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">
                                                Desde
                                            </Label>
                                            <input
                                                type="date"
                                                value={formStartTime}
                                                onChange={(e) =>
                                                    setFormStartTime(
                                                        e.target.value
                                                    )
                                                }
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">
                                                Hasta
                                            </Label>
                                            <input
                                                type="date"
                                                value={formEndTime}
                                                onChange={(e) =>
                                                    setFormEndTime(
                                                        e.target.value
                                                    )
                                                }
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">
                                            Estado
                                        </Label>
                                        <Select
                                            value={formStatus}
                                            onValueChange={setFormStatus}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Cualquier estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">
                                                    Cualquier estado
                                                </SelectItem>
                                                <SelectItem value="scheduled">
                                                    Programada / En espera
                                                </SelectItem>
                                                <SelectItem value="ongoing">
                                                    En curso
                                                </SelectItem>
                                                <SelectItem value="completed">
                                                    Completada
                                                </SelectItem>
                                                <SelectItem value="missed">
                                                    Faltó
                                                </SelectItem>
                                                <SelectItem value="cancelled">
                                                    Cancelada
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2 border-t">
                                    <Button
                                        variant="ghost"
                                        onClick={clearFilters}
                                        className="flex-1 text-xs"
                                    >
                                        Limpiar
                                    </Button>
                                    <Button
                                        onClick={applyFilters}
                                        className="flex-1 text-xs"
                                    >
                                        Aplicar
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Button asChild className="gap-2">
                            <Link href="/agenda/nueva-cita">
                                <Plus className="h-4 w-4" /> Nueva Cita
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* ── Badges de doctores ── */}
                <DentistStatusBadges appointments={appointments} />

                {/* ── Área de contenido: Filtros vs Calendario ── */}
                {hasFilters ? (
                    // VISTA DE RESULTADOS DE FILTRO (Reemplaza los tabs)
                    <div className="flex flex-col gap-4 mt-2">
                        <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                            <span className="text-sm font-medium text-primary">
                                Mostrando resultados filtrados (
                                {appointments.length})
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="h-8 gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
                            >
                                <X className="h-4 w-4" /> Quitar filtros
                            </Button>
                        </div>
                        <ListView
                            appointments={appointments}
                            isLoading={isLoading}
                            isFetchingNextPage={isFetchingNextPage}
                            hasNextPage={hasNextPage ?? false}
                            fetchNextPage={fetchNextPage}
                            emptyMessage="No se encontraron citas con estos filtros"
                        />
                    </div>
                ) : (
                    // VISTA NORMAL (Tabs Diaria/Semanal)
                    <Tabs
                        value={view}
                        onValueChange={(v) => setView(v as 'daily' | 'weekly')}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <TabsList>
                                <TabsTrigger value="daily" className="gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Vista Diaria
                                </TabsTrigger>
                                <TabsTrigger value="weekly" className="gap-1.5">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    Vista Semanal
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        {/* Navegación de fecha */}
                        <div className="flex items-center justify-center gap-2 mt-4">
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

                        {/* ── Vista Diaria ── */}
                        <TabsContent value="daily">
                            <ListView
                                appointments={appointments}
                                isLoading={isLoading}
                                isFetchingNextPage={isFetchingNextPage}
                                hasNextPage={hasNextPage ?? false}
                                fetchNextPage={fetchNextPage}
                                emptyMessage="Sin citas para este día"
                            />
                        </TabsContent>

                        {/* ── Vista Semanal ── */}
                        <TabsContent value="weekly">
                            <WeeklyView
                                weekStart={weekStart}
                                appointments={appointments}
                                isLoading={isLoading}
                            />
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    )
}
