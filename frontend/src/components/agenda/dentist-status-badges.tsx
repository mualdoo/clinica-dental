'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Stethoscope } from 'lucide-react'
import { useUsers } from '@/hooks/use-user'
import type { Appointment, Cubicle } from '@/types/agenda'
import type { User } from '@/types/auth'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isCurrentlyBusy(
    dentistId: string,
    appointments: Appointment[]
): { busy: boolean; cubicle?: Cubicle } {
    const now = new Date()
    const activeAppt = appointments.find(
        (a) =>
            a.dentistId === a.dentistId &&
            a.dentistId === dentistId &&
            a.status === 'scheduled' &&
            new Date(a.startTime) <= now &&
            new Date(a.endTime) >= now
    )
    return {
        busy: !!activeAppt,
        cubicle: activeAppt?.Cubicle,
    }
}

// ─── Badge individual ─────────────────────────────────────────────────────────
function DentistBadge({
    dentist,
    appointments,
}: {
    dentist: User
    appointments: Appointment[]
}) {
    const { busy, cubicle } = useMemo(
        () => isCurrentlyBusy(dentist.id, appointments),
        [dentist.id, appointments]
    )

    // Nombre visible: usa la parte antes del @ si no hay name/lastName en el modelo User
    const displayName = dentist.email.split('@')[0]

    return (
        <Badge
            variant="outline"
            className={`gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors
        ${
            busy
                ? 'border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300'
        }`}
        >
            {/* Punto de estado */}
            <span
                className={`h-1.5 w-1.5 rounded-full shrink-0
        ${busy ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}
            />

            {/* Nombre */}
            <span className="truncate max-w-20">{displayName}</span>

            {/* Cubículo si está ocupado */}
            {busy && cubicle && (
                <span className="text-[10px] opacity-70 shrink-0">
                    · C#{cubicle.number} - {cubicle.name}
                </span>
            )}
        </Badge>
    )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DentistBadgesSkeleton() {
    return (
        <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="h-7 w-24 rounded-full bg-muted animate-pulse"
                    style={{ width: `${60 + i * 15}px` }}
                />
            ))}
        </div>
    )
}

// ─── Componente principal ─────────────────────────────────────────────────────
interface DentistStatusBadgesProps {
    // Las citas del día ya cargadas desde el padre (useAppointments)
    appointments: Appointment[]
}

export function DentistStatusBadges({
    appointments,
}: DentistStatusBadgesProps) {
    const { data, isLoading } = useUsers('dentist')
    const dentists: User[] = data?.data.data ?? []

    // Métricas rápidas
    const busyCount = useMemo(
        () =>
            dentists.filter((d) => isCurrentlyBusy(d.id, appointments).busy)
                .length,
        [dentists, appointments]
    )

    if (isLoading) return <DentistBadgesSkeleton />

    if (dentists.length === 0) return null

    return (
        <div className="flex flex-col gap-1.5">
            {/* Contador resumen */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Stethoscope className="h-3.5 w-3.5" />
                <span>
                    {busyCount} ocupado{busyCount !== 1 ? 's' : ''}
                    {' · '}
                    {dentists.length - busyCount} libre
                    {dentists.length - busyCount !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
                {dentists.map((d) => (
                    <DentistBadge
                        key={d.id}
                        dentist={d}
                        appointments={appointments}
                    />
                ))}
            </div>
        </div>
    )
}
