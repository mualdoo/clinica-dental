'use client'

import { useRef } from 'react'
import {
    CalendarDays,
    Clock,
    MapPin,
    User,
    Plus,
    CalendarX,
    Loader2,
    ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useInfiniteAppointments } from '@/hooks/use-agenda'
import type { Appointment, AppointmentStatus } from '@/types/agenda'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })
}

// ─── Configs ──────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<
    AppointmentStatus,
    {
        label: string
        className: string
        dot: string
    }
> = {
    scheduled: {
        label: 'Programada',
        className:
            'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300',
        dot: 'bg-sky-500',
    },
    completed: {
        label: 'Completada',
        className:
            'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
        dot: 'bg-emerald-500',
    },
    missed: {
        label: 'Faltó',
        className:
            'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300',
        dot: 'bg-rose-500',
    },
    cancelled: {
        label: 'Cancelada',
        className:
            'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300',
        dot: 'bg-rose-500',
    },
    ongoing: {
        label: 'En curso',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
    },
}

// ─── Tarjeta de cita ──────────────────────────────────────────────────────────
function AppointmentCard({ appt }: { appt: Appointment }) {
    const cfg = STATUS_CFG[appt.status]
    const isPast = new Date(appt.endTime) < new Date()
    const isToday =
        new Date(appt.startTime).toDateString() === new Date().toDateString()

    return (
        <div
            className={`relative flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all
      ${
          appt.status === 'scheduled' && !isPast
              ? 'border-primary/30 hover:border-primary/50 hover:shadow-md'
              : 'border-border/60 hover:border-border'
      }`}
        >
            {/* Franja lateral */}
            <div
                className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full ${cfg.dot}`}
            />

            <div className="ml-3 flex flex-col gap-2.5">
                {/* Fila superior: fecha + badge */}
                <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                            {isToday && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-2 py-0.5">
                                    Hoy
                                </span>
                            )}
                            <p className="text-sm font-semibold text-foreground capitalize">
                                {formatDate(appt.startTime)}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTime(appt.startTime)} —{' '}
                            {formatTime(appt.endTime)}
                        </div>
                    </div>

                    <Badge
                        variant="outline"
                        className={`text-[11px] px-2 py-0.5 font-semibold shrink-0 ${cfg.className}`}
                    >
                        <span
                            className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${cfg.dot}`}
                        />
                        {cfg.label}
                    </Badge>
                </div>

                {/* Detalles */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        Cubículo #{appt.Cubicle.number} · {appt.Cubicle.name}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <User className="h-3 w-3 shrink-0" />
                        Dr. #{appt.dentistName}
                    </span>
                </div>
            </div>
        </div>
    )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function AppointmentSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="h-24 rounded-xl bg-muted animate-pulse"
                />
            ))}
        </div>
    )
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function CitasPortalPage() {
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteAppointments({ enabled: true })

    // Reutiliza el hook de infinite scroll si lo tienes,
    // o usa el useEffect inline:
    const loaderRef = useInfiniteScroll(hasNextPage, fetchNextPage)

    const allAppts: Appointment[] =
        data?.pages.flatMap((p) => p.data.data) ?? []

    // Separa próximas y pasadas
    const now = new Date()
    const upcoming = allAppts
        .filter((a) => new Date(a.startTime) >= now || a.status === 'scheduled')
        .sort(
            (a, b) =>
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime()
        )
    const past = allAppts
        .filter((a) => new Date(a.startTime) < now && a.status !== 'scheduled')
        .sort(
            (a, b) =>
                new Date(b.startTime).getTime() -
                new Date(a.startTime).getTime()
        )

    return (
        <div className="mx-auto max-w-2xl flex flex-col gap-5 pb-8">
            {/* Encabezado */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                        Mis Citas
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isLoading
                            ? 'Cargando…'
                            : `${allAppts.length} cita${allAppts.length !== 1 ? 's' : ''} en total`}
                    </p>
                </div>

                {/* Botón agregar — placeholder por ahora */}
                <Button size="sm" className="gap-1.5" onClick={() => {}}>
                    <Plus className="h-3.5 w-3.5" />
                    Solicitar cita
                </Button>
            </div>

            {isLoading ? (
                <AppointmentSkeleton />
            ) : allAppts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                    <CalendarX className="h-12 w-12 opacity-20" />
                    <p className="text-sm font-medium">Sin citas registradas</p>
                    <p className="text-xs opacity-60 text-center max-w-xs">
                        Aquí aparecerán tus citas una vez que el consultorio las
                        agende.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {/* Próximas / activas */}
                    {upcoming.length > 0 && (
                        <section className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-primary" />
                                <h2 className="text-sm font-semibold text-foreground">
                                    Próximas ({upcoming.length})
                                </h2>
                            </div>
                            {upcoming.map((a) => (
                                <AppointmentCard key={a.id} appt={a} />
                            ))}
                        </section>
                    )}

                    {/* Pasadas */}
                    {past.length > 0 && (
                        <section className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <h2 className="text-sm font-semibold text-muted-foreground">
                                    Historial ({past.length})
                                </h2>
                            </div>
                            {past.map((a) => (
                                <AppointmentCard key={a.id} appt={a} />
                            ))}
                        </section>
                    )}
                </div>
            )}

            {/* Scroll infinito */}
            <div ref={loaderRef} className="flex justify-center py-2">
                {isFetchingNextPage ? (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Cargando más…
                    </div>
                ) : hasNextPage ? (
                    <button
                        onClick={() => fetchNextPage()}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronDown className="h-3.5 w-3.5" />
                        Cargar más
                    </button>
                ) : null}
            </div>
        </div>
    )
}
