'use client'

import {
    CalendarDays,
    FileText,
    CreditCard,
    Clock,
    AlertCircle,
} from 'lucide-react'
import { useAppointments, useInfiniteAppointments } from '@/hooks/use-agenda'
import { useClinicalNotes } from '@/hooks/use-patient'

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-MX', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
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

// ─── Hardcoded cuenta ─────────────────────────────────────────────────────────
const ACCOUNT = { total: 4500, paid: 1200, currency: 'MXN' }

export function TabResumen({ patientId }: { patientId: string }) {
    const { data: apptData, isLoading: apptLoading } = useAppointments({
        patientId,
    })

    const { data: notesData, isLoading: notesLoading } =
        useClinicalNotes(patientId)

    const allAppts = apptData?.data.data.flatMap((p) => p) ?? []

    const upcoming = allAppts
        .filter(
            (a) =>
                a.status === 'scheduled' && new Date(a.startTime) > new Date()
        )
        .sort(
            (a, b) =>
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime()
        )[0]

    const notes = (notesData?.pages.flatMap((p) => p.data.data) ?? []).slice(
        0,
        3
    )
    const balance = ACCOUNT.total - ACCOUNT.paid

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ── Próxima cita ── */}
            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Próxima Cita
                </div>
                {apptLoading ? (
                    <div className="h-14 rounded-lg bg-muted animate-pulse" />
                ) : upcoming ? (
                    <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-3 flex flex-col gap-1">
                        <p className="text-sm font-semibold text-foreground capitalize">
                            {formatDate(upcoming.startTime)}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTime(upcoming.startTime)} —{' '}
                            {formatTime(upcoming.endTime)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Cubículo #{upcoming.cubicleId.slice(-4)}
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                        <AlertCircle className="h-4 w-4 opacity-40" />
                        Sin citas programadas
                    </div>
                )}
            </div>

            {/* ── Estado de cuenta ── */}
            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Estado de Cuenta
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Total del tratamiento</span>
                        <span className="font-semibold text-foreground">
                            ${ACCOUNT.total.toLocaleString()} {ACCOUNT.currency}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Pagado</span>
                        <span className="font-semibold text-emerald-600">
                            ${ACCOUNT.paid.toLocaleString()} {ACCOUNT.currency}
                        </span>
                    </div>
                    {/* Barra de progreso */}
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{
                                width: `${(ACCOUNT.paid / ACCOUNT.total) * 100}%`,
                            }}
                        />
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                            Saldo pendiente
                        </span>
                        <span className="font-bold text-rose-600">
                            ${balance.toLocaleString()} {ACCOUNT.currency}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Últimas notas ── */}
            <div className="md:col-span-2 rounded-xl border border-border/60 bg-card p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    Últimas Notas Clínicas
                </div>
                {notesLoading ? (
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
                                <p className="text-xs font-semibold text-foreground line-clamp-1">
                                    {note.subjective}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {note.assessment}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
