'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    CalendarDays,
    CreditCard,
    FileText,
    Clock,
    ChevronRight,
    AlertTriangle,
    CheckCircle2,
    CalendarX,
    Loader2,
    User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppointments } from '@/hooks/use-agenda'
import { useHealthAlerts, useClinicalNotes } from '@/hooks/use-patient'
import { useQuotesByPatient } from '@/hooks/use-billing'
import { useAuthStore } from '@/store/auth-store'
import type { AppointmentStatus } from '@/types/agenda'
import type { HealthAlertType } from '@/types/patient'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    })
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })
}

function formatMoney(n: number) {
    return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
}

const ALERT_TYPE_LABELS: Record<HealthAlertType, string> = {
    allergy: 'Alergia',
    condition: 'Condición',
    medication: 'Medicamento',
    other: 'Otro',
}

const STATUS_CFG: Record<
    AppointmentStatus,
    { label: string; className: string }
> = {
    scheduled: {
        label: 'Programada',
        className: 'bg-sky-100 text-sky-700 border-sky-200',
    },
    completed: {
        label: 'Completada',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    missed: {
        label: 'Faltó',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    cancelled: {
        label: 'Cancelada',
        className: 'bg-rose-100 text-rose-700 border-rose-200',
    },
}

// ─── Componentes de sección ───────────────────────────────────────────────────
function SectionCard({
    title,
    icon,
    href,
    linkLabel,
    isLoading,
    children,
}: {
    title: string
    icon: React.ReactNode
    href?: string
    linkLabel?: string
    isLoading?: boolean
    children: React.ReactNode
}) {
    const router = useRouter()
    return (
        <div className="rounded-xl border border-border/60 bg-card shadow-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    {icon}
                    {title}
                </div>
                {href && (
                    <button
                        onClick={() => router.push(href)}
                        className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                    >
                        {linkLabel ?? 'Ver todo'}
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
            <div className="p-5">
                {isLoading ? (
                    <div className="h-16 rounded-lg bg-muted animate-pulse" />
                ) : (
                    children
                )}
            </div>
        </div>
    )
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function PortalPage() {
    const router = useRouter()
    const user = useAuthStore((s) => s.user)
    const activePatientId = useAuthStore((s) => s.activePatientId)

    // El backend filtra automáticamente por x-active-patient-id
    const { data: apptData, isLoading: apptLoading } = useAppointments({})
    const { data: alertsData, isLoading: alertsLoading } = useHealthAlerts(
        activePatientId ?? ''
    )
    const { data: notesData, isLoading: notesLoading } = useClinicalNotes(
        activePatientId ?? ''
    )
    const { data: quotesData, isLoading: quotesLoading } = useQuotesByPatient(
        activePatientId ?? ''
    )

    // Próxima cita — la más cercana con status scheduled
    const allAppts = apptData?.data.data.flatMap((p) => p) ?? []
    const nextAppt = allAppts
        .filter(
            (a) =>
                a.status === 'scheduled' && new Date(a.startTime) > new Date()
        )
        .sort(
            (a, b) =>
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime()
        )[0]

    // Historial reciente — últimas 3 citas completadas
    const recentAppts = allAppts
        .filter((a) => a.status === 'completed')
        .sort(
            (a, b) =>
                new Date(b.startTime).getTime() -
                new Date(a.startTime).getTime()
        )
        .slice(0, 3)

    // Alertas de salud
    const alerts = alertsData?.pages.flatMap((p) => p.data.data) ?? []

    // Última nota clínica
    const lastNote = (notesData?.pages.flatMap((p) => p.data.data) ?? [])[0]

    // Saldo pendiente — suma de (total - pagado) en presupuestos aceptados
    const quotes = quotesData?.pages.flatMap((p) => p.data.data) ?? []
    const totalPending = quotes
        .filter((q) => q.status === 'accepted')
        .reduce((acc, q) => acc + q.total, 0)

    // Hora del día para el saludo
    const [greeting, setGreeting] = useState<string>('')

    useEffect(() => {
        const currentHour = new Date().getHours()
        setGreeting(
            currentHour < 12
                ? 'Buenos días'
                : currentHour < 19
                  ? 'Buenas tardes'
                  : 'Buenas noches'
        )
    }, [])

    return (
        <div className="mx-auto max-w-2xl flex flex-col gap-5 pb-8">
            {/* ── Saludo ── */}
            <div className="flex items-center gap-3 pt-1">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">
                        {greeting ? `${greeting},` : '\u00A0'}
                    </p>
                    <h1 className="text-lg font-bold text-foreground leading-tight">
                        {user?.name}
                    </h1>
                </div>
            </div>

            {/* ── Alertas de salud — siempre visible si hay ── */}
            {!alertsLoading && alerts.length > 0 && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800 p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-400">
                        <AlertTriangle className="h-4 w-4" />
                        Alertas de Salud
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className="flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300"
                            >
                                <span className="font-bold uppercase tracking-wide shrink-0 mt-0.5">
                                    {ALERT_TYPE_LABELS[alert.type]}:
                                </span>
                                <span>{alert.content}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Próxima cita ── */}
            <SectionCard
                title="Próxima Cita"
                icon={<CalendarDays className="h-4 w-4 text-primary" />}
                href="/portal/citas"
                linkLabel="Mis citas"
                isLoading={apptLoading}
            >
                {nextAppt ? (
                    <div className="flex flex-col gap-3">
                        <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3.5 flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-foreground capitalize">
                                    {formatDate(nextAppt.startTime)}
                                </p>
                                <span
                                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CFG[nextAppt.status].className}`}
                                >
                                    {STATUS_CFG[nextAppt.status].label}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(nextAppt.startTime)} —{' '}
                                    {formatTime(nextAppt.endTime)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CalendarDays className="h-3 w-3" />
                                    Cubículo #{nextAppt.Cubicle.number} ·{' '}
                                    {nextAppt.Cubicle.name}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
                        <CalendarX className="h-8 w-8 opacity-20" />
                        <p className="text-sm">Sin citas programadas</p>
                    </div>
                )}
            </SectionCard>

            {/* ── Saldo pendiente ── */}
            <SectionCard
                title="Estado de Cuenta"
                icon={<CreditCard className="h-4 w-4 text-primary" />}
                href="/portal/citas"
                linkLabel="Ver detalle"
                isLoading={quotesLoading}
            >
                {totalPending > 0 ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Saldo pendiente
                            </p>
                            <p className="text-2xl font-bold text-rose-600">
                                {formatMoney(totalPending)}
                            </p>
                        </div>
                        {/* Barra visual */}
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div className="h-full w-3/4 rounded-full bg-rose-400" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tienes{' '}
                            {
                                quotes.filter((q) => q.status === 'accepted')
                                    .length
                            }{' '}
                            presupuesto
                            {quotes.filter((q) => q.status === 'accepted')
                                .length !== 1
                                ? 's'
                                : ''}{' '}
                            activo
                            {quotes.filter((q) => q.status === 'accepted')
                                .length !== 1
                                ? 's'
                                : ''}
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 py-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Sin saldo pendiente
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Estás al corriente con tus pagos
                            </p>
                        </div>
                    </div>
                )}
            </SectionCard>

            {/* ── Última nota clínica ── */}
            <SectionCard
                title="Última Nota Clínica"
                icon={<FileText className="h-4 w-4 text-primary" />}
                href="/portal/expediente"
                linkLabel="Mi expediente"
                isLoading={notesLoading}
            >
                {lastNote ? (
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-semibold text-foreground line-clamp-1">
                            {lastNote.subjective}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-3">
                            {lastNote.assessment}
                        </p>
                        {lastNote.plan && (
                            <div className="rounded-lg bg-muted/40 border border-border/40 px-3 py-2 mt-1">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
                                    Plan
                                </p>
                                <p className="text-xs text-foreground line-clamp-2">
                                    {lastNote.plan}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground py-2">
                        Sin notas clínicas registradas
                    </p>
                )}
            </SectionCard>

            {/* ── Historial reciente de citas ── */}
            <SectionCard
                title="Citas Recientes"
                icon={<Clock className="h-4 w-4 text-primary" />}
                href="/portal/citas"
                isLoading={apptLoading}
            >
                {recentAppts.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                        Sin historial de citas
                    </p>
                ) : (
                    <div className="flex flex-col divide-y divide-border/40">
                        {recentAppts.map((appt) => (
                            <div
                                key={appt.id}
                                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-medium text-foreground capitalize">
                                        {formatDate(appt.startTime)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatTime(appt.startTime)}
                                    </p>
                                </div>
                                <span
                                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CFG[appt.status].className}`}
                                >
                                    {STATUS_CFG[appt.status].label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>

            {/* ── Cambiar perfil ── */}
            <Button
                variant="outline"
                className="w-full gap-2 text-muted-foreground"
                onClick={() => router.push('/portal/seleccionar-perfil')}
            >
                <User className="h-4 w-4" />
                Cambiar perfil
            </Button>
        </div>
    )
}
