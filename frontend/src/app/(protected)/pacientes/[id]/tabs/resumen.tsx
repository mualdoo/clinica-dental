'use client'

import { useMemo } from 'react'
import {
    CalendarDays,
    FileText,
    CreditCard,
    Clock,
    AlertCircle,
    CheckCircle2,
    TrendingDown,
} from 'lucide-react'
import { useAppointments } from '@/hooks/use-agenda'
import { useClinicalNotes } from '@/hooks/use-patient'
import { useQuotesByPatient, usePayments } from '@/hooks/use-billing'
import type { Quote } from '@/types/billing'
import { usePatientBalance } from '@/hooks/use-patient-balance'

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

function formatMoney(n: number) {
    return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
}

// ─── Widget: Próxima cita ─────────────────────────────────────────────────────
function NextAppointmentWidget({ patientId }: { patientId: string }) {
    const { data, isLoading } = useAppointments({ patientId })

    const allAppts = data?.data.data.flatMap((p) => p) ?? []
    const next = allAppts
        .filter(
            (a) =>
                a.status === 'scheduled' && new Date(a.startTime) > new Date()
        )
        .sort(
            (a, b) =>
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime()
        )[0]

    return (
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CalendarDays className="h-4 w-4 text-primary" />
                Próxima Cita
            </div>

            {isLoading ? (
                <div className="h-16 rounded-lg bg-muted animate-pulse" />
            ) : next ? (
                <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-3 flex flex-col gap-1.5">
                    <p className="text-sm font-semibold text-foreground capitalize">
                        {formatDate(next.startTime)}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(next.startTime)} —{' '}
                            {formatTime(next.endTime)}
                        </span>
                        <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            Cubículo #{next.cubicleId.slice(-4)}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <AlertCircle className="h-4 w-4 opacity-40" />
                    Sin citas programadas
                </div>
            )}
        </div>
    )
}

// ─── Widget: Estado de cuenta ─────────────────────────────────────────────────
function AccountWidget({ patientId }: { patientId: string }) {
    const { quoteBalances, totalAmount, totalPaid, totalPending, isLoading } =
        usePatientBalance(patientId)

    const progressPct =
        totalAmount > 0 ? Math.min(100, (totalPaid / totalAmount) * 100) : 0

    return (
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CreditCard className="h-4 w-4 text-primary" />
                Estado de Cuenta
            </div>

            {isLoading ? (
                <div className="h-24 rounded-lg bg-muted animate-pulse" />
            ) : quoteBalances.length === 0 ? (
                <div className="flex items-center gap-2.5 py-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Sin saldo pendiente
                        </p>
                        <p className="text-xs text-muted-foreground">
                            No hay presupuestos activos
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {/* Totales */}
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            {
                                label: 'Total',
                                value: formatMoney(totalAmount),
                                className: 'text-foreground',
                            },
                            {
                                label: 'Pagado',
                                value: formatMoney(totalPaid),
                                className: 'text-emerald-600',
                            },
                            {
                                label: 'Pendiente',
                                value: formatMoney(totalPending),
                                className:
                                    totalPending > 0
                                        ? 'text-rose-600'
                                        : 'text-emerald-600',
                            },
                        ].map(({ label, value, className }) => (
                            <div key={label} className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                    {label}
                                </span>
                                <span
                                    className={`text-xs font-bold ${className}`}
                                >
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Barra de progreso */}
                    <div className="flex flex-col gap-1">
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground text-right">
                            {progressPct.toFixed(0)}% pagado
                        </p>
                    </div>

                    {/* Desglose por presupuesto si hay más de uno */}
                    {quoteBalances.length > 1 && (
                        <div className="flex flex-col gap-1.5 border-t border-border/40 pt-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                                Desglose
                            </p>
                            {quoteBalances.map(({ quote, paid, pending }) => (
                                <QuoteBalanceRow
                                    key={quote.id}
                                    quote={quote}
                                    paid={paid}
                                    pending={pending}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function QuoteBalanceRow({
    quote,
    paid,
    pending,
}: {
    quote: Quote
    paid: number
    pending: number
}) {
    const pct = quote.total > 0 ? Math.min(100, (paid / quote.total) * 100) : 0

    return (
        <div className="flex items-center gap-2.5 rounded-lg bg-muted/30 border border-border/40 px-2.5 py-2">
            <TrendingDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-foreground truncate">
                        #{quote.id.slice(-6).toUpperCase()}
                    </span>
                    <span
                        className={`text-[11px] font-bold shrink-0 ${pending > 0 ? 'text-rose-600' : 'text-emerald-600'}`}
                    >
                        {pending > 0
                            ? `− ${formatMoney(pending)}`
                            : 'Liquidado'}
                    </span>
                </div>
                <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>
        </div>
    )
}

// ─── Widget: Últimas notas ────────────────────────────────────────────────────
function ClinicalNotesWidget({ patientId }: { patientId: string }) {
    const { data, isLoading } = useClinicalNotes(patientId)
    const notes = (data?.pages.flatMap((p) => p.data.data) ?? []).slice(0, 3)

    return (
        <div className="md:col-span-2 rounded-xl border border-border/60 bg-card p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                Últimas Notas Clínicas
            </div>

            {isLoading ? (
                <div className="flex flex-col gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-14 rounded-lg bg-muted animate-pulse"
                        />
                    ))}
                </div>
            ) : notes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                    Sin notas clínicas registradas
                </p>
            ) : (
                <div className="flex flex-col gap-2">
                    {notes.map((note) => (
                        <div
                            key={note.id}
                            className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5 flex flex-col gap-1"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-foreground line-clamp-1">
                                    {note.subjective}
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {note.assessment}
                            </p>
                            {note.plan && (
                                <p className="text-[11px] text-muted-foreground/70 line-clamp-1 italic">
                                    Plan: {note.plan}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Tab principal ────────────────────────────────────────────────────────────
export function TabResumen({ patientId }: { patientId: string }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NextAppointmentWidget patientId={patientId} />
            <AccountWidget patientId={patientId} />
            <ClinicalNotesWidget patientId={patientId} />
        </div>
    )
}
