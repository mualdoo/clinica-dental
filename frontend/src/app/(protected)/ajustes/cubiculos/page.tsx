'use client'

import { useState } from 'react'
import { format, isWithinInterval, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    Plus,
    Building2,
    Clock,
    MoreVertical,
    Pencil,
    Trash2,
    ChevronDown,
    ChevronUp,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    CubicleForm,
    type CubicleFormValues,
} from '@/components/agenda/cubicle-form'
import {
    useCubicles,
    useCreateCubicle,
    usePatchCubicle,
    useDeleteCubicle,
} from '@/hooks/use-agenda'
import { useAppointments } from '@/hooks/use-agenda'
import type { Cubicle, Appointment } from '@/types/agenda'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(iso: string) {
    return format(parseISO(iso), 'hh:mm a', { locale: es })
}

function formatDateShort(iso: string) {
    return format(parseISO(iso), 'EEE d MMM', { locale: es })
}

function isOccupiedNow(
    appointments: Appointment[],
    cubicleId: string
): boolean {
    const now = new Date()
    return appointments.some(
        (a) =>
            a.cubicleId === cubicleId &&
            a.status === 'scheduled' &&
            isWithinInterval(now, {
                start: parseISO(a.startTime),
                end: parseISO(a.endTime),
            })
    )
}

function getUpcomingForCubicle(
    appointments: Appointment[],
    cubicleId: string,
    limit = 3
): Appointment[] {
    const now = new Date()
    return appointments
        .filter(
            (a) =>
                a.cubicleId === cubicleId &&
                a.status === 'scheduled' &&
                parseISO(a.startTime) > now
        )
        .sort(
            (a, b) =>
                parseISO(a.startTime).getTime() -
                parseISO(b.startTime).getTime()
        )
        .slice(0, limit)
}

// ─── Modal genérico (Add / Edit) ──────────────────────────────────────────────
function CubicleModal({
    open,
    onOpenChange,
    cubicle,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    cubicle?: Cubicle
}) {
    const { mutate: create, isPending: creating } = useCreateCubicle()
    const { mutate: patch, isPending: patching } = usePatchCubicle()

    const isEditing = !!cubicle
    const isPending = creating || patching

    function handleSubmit(values: CubicleFormValues) {
        if (isEditing) {
            patch(
                { id: cubicle.id, dto: values },
                { onSuccess: () => onOpenChange(false) }
            )
        } else {
            create(values, { onSuccess: () => onOpenChange(false) })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar Cubículo' : 'Nuevo Cubículo'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Modifica los datos del cubículo seleccionado.'
                            : 'Completa los datos para agregar un nuevo cubículo.'}
                    </DialogDescription>
                </DialogHeader>
                <CubicleForm
                    initialData={cubicle}
                    isLoading={isPending}
                    onSubmit={handleSubmit}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    )
}

// ─── Mini-tarjeta de cita (igual que agenda semanal) ──────────────────────────
function MiniAppointmentCard({ appt }: { appt: Appointment }) {
    const STATUS_COLORS: Record<string, string> = {
        scheduled: 'bg-sky-500',
        completed: 'bg-emerald-500',
        missed: 'bg-amber-500',
        cancelled: 'bg-rose-500',
    }
    return (
        <div className="rounded-lg border border-border/50 bg-muted/30 px-2.5 py-2 text-xs flex flex-col gap-0.5">
            <span className="font-medium text-foreground truncate">
                Paciente #{appt.patientId.slice(-6)}
            </span>
            <div className="flex items-center justify-between gap-1">
                <span className="text-muted-foreground">
                    {formatDateShort(appt.startTime)} ·{' '}
                    {formatTime(appt.startTime)}
                </span>
                <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_COLORS[appt.status]}`}
                />
            </div>
        </div>
    )
}

// ─── Tarjeta de cubículo ──────────────────────────────────────────────────────
function CubicleCard({
    cubicle,
    allAppointments,
    onEdit,
}: {
    cubicle: Cubicle
    allAppointments: Appointment[]
    onEdit: (c: Cubicle) => void
}) {
    const [showAppts, setShowAppts] = useState(false)
    const { mutate: remove } = useDeleteCubicle()
    const { mutate: patch } = usePatchCubicle()

    const occupied = isOccupiedNow(allAppointments, cubicle.id)
    const upcoming = getUpcomingForCubicle(allAppointments, cubicle.id)

    function handleDelete() {
        if (confirm(`¿Eliminar "${cubicle.name}"?`)) remove(cubicle.id)
    }

    function toggleActive() {
        patch({ id: cubicle.id, dto: { isActive: !cubicle.isActive } })
    }

    return (
        <div
            className={`rounded-xl border bg-card shadow-sm flex flex-col overflow-hidden transition-all
      ${cubicle.isActive ? 'border-border/60' : 'border-dashed border-border/40 opacity-60'}`}
        >
            {/* ── Header ── */}
            <div className="flex items-center gap-3 px-4 py-3.5">
                {/* Icono */}
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
          ${occupied ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}
                >
                    <Building2
                        className={`h-5 w-5 ${occupied ? 'text-rose-600' : 'text-emerald-600'}`}
                    />
                </div>

                {/* Nombre + badges */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground truncate">
                            #{cubicle.number} · {cubicle.name}
                        </p>
                        {/* Badge ocupado/libre */}
                        {cubicle.isActive ? (
                            <Badge
                                variant="outline"
                                className={`text-[10px] px-2 py-0 font-semibold border
                  ${
                      occupied
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300'
                  }`}
                            >
                                <span
                                    className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full
                  ${occupied ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                />
                                {occupied ? 'Ocupado' : 'Libre'}
                            </Badge>
                        ) : (
                            <Badge
                                variant="outline"
                                className="text-[10px] px-2 py-0 text-muted-foreground"
                            >
                                Inactivo
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {upcoming.length > 0
                            ? `${upcoming.length} próxima${upcoming.length !== 1 ? 's' : ''} cita${upcoming.length !== 1 ? 's' : ''}`
                            : 'Sin citas próximas'}
                    </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 shrink-0">
                    {/* Toggle citas próximas */}
                    {upcoming.length > 0 && (
                        <button
                            onClick={() => setShowAppts((s) => !s)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            aria-label="Ver próximas citas"
                        >
                            {showAppts ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </button>
                    )}

                    {/* Menú de opciones */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                                onClick={() => onEdit(cubicle)}
                                className="gap-2 cursor-pointer"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={toggleActive}
                                className="gap-2 cursor-pointer"
                            >
                                <Building2 className="h-3.5 w-3.5" />
                                {cubicle.isActive ? 'Desactivar' : 'Activar'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* ── Próximas citas (desplegable) ── */}
            {showAppts && upcoming.length > 0 && (
                <div className="border-t border-border/40 bg-muted/20 px-4 pb-3 pt-2.5 flex flex-col gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                        Próximas citas
                    </p>
                    {upcoming.map((appt) => (
                        <MiniAppointmentCard key={appt.id} appt={appt} />
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CubicleSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="h-19 rounded-xl bg-muted animate-pulse"
                />
            ))}
        </div>
    )
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function CubicolosPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<Cubicle | undefined>()

    const { data: cubiclesData, isLoading: cubiclesLoading } = useCubicles()
    const { data: apptsData } = useAppointments({})

    const cubicles: Cubicle[] = cubiclesData?.data.data.flatMap((p) => p) ?? []
    const appointments: Appointment[] =
        apptsData?.data.data.flatMap((p) => p) ?? []

    const active = cubicles.filter((c) => c.isActive)
    const inactive = cubicles.filter((c) => !c.isActive)
    const occupied = active.filter((c) => isOccupiedNow(appointments, c.id))

    function openAdd() {
        setEditTarget(undefined)
        setModalOpen(true)
    }

    function openEdit(cubicle: Cubicle) {
        setEditTarget(cubicle)
        setModalOpen(true)
    }

    return (
        <div className="flex flex-col gap-5">
            {/* ── Encabezado ── */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Cubículos
                </h1>
                <p className="text-sm text-muted-foreground">
                    Gestión de espacios de atención
                </p>
            </div>

            {/* ── Stats + Botón ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {!cubiclesLoading && (
                    <div className="flex flex-wrap gap-3">
                        {[
                            {
                                label: 'Total',
                                value: cubicles.length,
                                className: 'text-foreground',
                            },
                            {
                                label: 'Activos',
                                value: active.length,
                                className: 'text-emerald-600',
                            },
                            {
                                label: 'Ocupados',
                                value: occupied.length,
                                className: 'text-rose-600',
                            },
                        ].map(({ label, value, className }) => (
                            <div
                                key={label}
                                className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm shadow-sm"
                            >
                                <span className="text-muted-foreground">
                                    {label}:
                                </span>
                                <span className={`font-bold ${className}`}>
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <Button onClick={openAdd} className="gap-2 shrink-0">
                    <Plus className="h-4 w-4" />
                    Agregar Cubículo
                </Button>
            </div>

            {/* ── Lista ── */}
            {cubiclesLoading ? (
                <CubicleSkeleton />
            ) : cubicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                    <Building2 className="h-10 w-10 opacity-20" />
                    <p className="text-sm">No hay cubículos registrados</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={openAdd}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Agregar el primero
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {/* Activos */}
                    {active.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Activos ({active.length})
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {active.map((c) => (
                                    <CubicleCard
                                        key={c.id}
                                        cubicle={c}
                                        allAppointments={appointments}
                                        onEdit={openEdit}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Inactivos */}
                    {inactive.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Inactivos ({inactive.length})
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {inactive.map((c) => (
                                    <CubicleCard
                                        key={c.id}
                                        cubicle={c}
                                        allAppointments={appointments}
                                        onEdit={openEdit}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Modal Add/Edit ── */}
            <CubicleModal
                open={modalOpen}
                onOpenChange={(v) => {
                    setModalOpen(v)
                    if (!v) setEditTarget(undefined)
                }}
                cubicle={editTarget}
            />
        </div>
    )
}
