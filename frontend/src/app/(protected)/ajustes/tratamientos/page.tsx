'use client'

import { useState, useMemo } from 'react'
import {
    Plus,
    Search,
    X,
    Stethoscope,
    Clock,
    Pencil,
    Trash2,
    MoreVertical,
    BadgeDollarSign,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    TreatmentForm,
    type TreatmentFormValues,
} from '@/components/billing/treatment-form'
import {
    useTreatments,
    useCreateTreatment,
    usePatchTreatment,
    useDeleteTreatment,
} from '@/hooks/use-billing'
import type { Treatment } from '@/types/billing'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatMoney(n: number) {
    return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

function formatDuration(min: number) {
    if (min < 60) return `${min} min`
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `${h}h ${m}min` : `${h}h`
}

// ─── Modal Add / Edit ─────────────────────────────────────────────────────────
function TreatmentModal({
    open,
    onOpenChange,
    treatment,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    treatment?: Treatment
}) {
    const { mutate: create, isPending: creating } = useCreateTreatment()
    const { mutate: patch, isPending: patching } = usePatchTreatment()

    const isEditing = !!treatment
    const isPending = creating || patching

    function handleSubmit(values: TreatmentFormValues) {
        if (isEditing) {
            patch(
                { id: treatment.id, dto: values },
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
                        {isEditing ? 'Editar tratamiento' : 'Nuevo tratamiento'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Modifica los datos del tratamiento seleccionado.'
                            : 'Completa los datos para agregar un nuevo tratamiento al catálogo.'}
                    </DialogDescription>
                </DialogHeader>
                <TreatmentForm
                    initialData={treatment}
                    isLoading={isPending}
                    onSubmit={handleSubmit}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    )
}

// ─── Fila de tratamiento ──────────────────────────────────────────────────────
function TreatmentRow({
    treatment,
    onEdit,
}: {
    treatment: Treatment
    onEdit: (t: Treatment) => void
}) {
    const { mutate: patch } = usePatchTreatment()
    const { mutate: remove } = useDeleteTreatment()

    function toggleActive() {
        patch({ id: treatment.id, dto: { isActive: !treatment.isActive } })
    }

    function handleDelete() {
        if (confirm(`¿Eliminar "${treatment.name}"?`)) remove(treatment.id)
    }

    return (
        <TableRow
            className={`group transition-colors ${!treatment.isActive ? 'opacity-50' : ''}`}
        >
            {/* Nombre */}
            <TableCell>
                <div className="flex items-center gap-2.5">
                    <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
            ${
                treatment.isActive
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
            }`}
                    >
                        <Stethoscope className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-foreground">
                            {treatment.name}
                        </span>
                        {/* En mobile muestra precio y duración debajo del nombre */}
                        <span className="sm:hidden text-xs text-muted-foreground">
                            {formatMoney(treatment.unitPrice)} ·{' '}
                            {formatDuration(treatment.duration)}
                        </span>
                    </div>
                </div>
            </TableCell>

            {/* Precio — oculto en mobile */}
            <TableCell className="hidden sm:table-cell">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <BadgeDollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatMoney(treatment.unitPrice)}
                </div>
            </TableCell>

            {/* Duración — oculto en mobile */}
            <TableCell className="hidden sm:table-cell">
                <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDuration(treatment.duration)}
                </div>
            </TableCell>

            {/* Estado */}
            <TableCell>
                <Badge
                    variant="outline"
                    className={`text-[11px] font-semibold
            ${
                treatment.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300'
                    : 'bg-muted text-muted-foreground'
            }`}
                >
                    <span
                        className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full
            ${treatment.isActive ? 'bg-emerald-500' : 'bg-muted-foreground'}`}
                    />
                    {treatment.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
            </TableCell>

            {/* Acciones */}
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 ml-auto">
                            <MoreVertical className="h-4 w-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                            onClick={() => onEdit(treatment)}
                            className="gap-2 cursor-pointer"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={toggleActive}
                            className="gap-2 cursor-pointer"
                        >
                            {treatment.isActive ? (
                                <ToggleLeft className="h-3.5 w-3.5" />
                            ) : (
                                <ToggleRight className="h-3.5 w-3.5" />
                            )}
                            {treatment.isActive ? 'Desactivar' : 'Activar'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleDelete}
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function TableSkeleton() {
    return (
        <>
            {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell>
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse shrink-0" />
                            <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                        </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                    </TableCell>
                    <TableCell>
                        <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
                    </TableCell>
                    <TableCell />
                </TableRow>
            ))}
        </>
    )
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function TratamientosPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<Treatment | undefined>()
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

    const { data, isLoading } = useTreatments()
    const treatments: Treatment[] = data?.data.data ?? []

    // Filtrado local
    const filtered = useMemo(() => {
        return treatments.filter((t) => {
            const matchSearch = t.name
                .toLowerCase()
                .includes(search.toLowerCase())
            const matchFilter =
                filter === 'all'
                    ? true
                    : filter === 'active'
                      ? t.isActive
                      : !t.isActive
            return matchSearch && matchFilter
        })
    }, [treatments, search, filter])

    // Stats
    const activeCount = treatments.filter((t) => t.isActive).length
    const inactiveCount = treatments.filter((t) => !t.isActive).length

    function openAdd() {
        setEditTarget(undefined)
        setModalOpen(true)
    }

    function openEdit(t: Treatment) {
        setEditTarget(t)
        setModalOpen(true)
    }

    return (
        <div className="flex flex-col gap-5">
            {/* ── Encabezado ── */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Tratamientos
                </h1>
                <p className="text-sm text-muted-foreground">
                    Catálogo de tratamientos disponibles para presupuestos
                </p>
            </div>

            {/* ── Stats ── */}
            {!isLoading && (
                <div className="flex flex-wrap gap-3">
                    {[
                        {
                            label: 'Total',
                            value: treatments.length,
                            active: filter === 'all',
                            key: 'all',
                        },
                        {
                            label: 'Activos',
                            value: activeCount,
                            active: filter === 'active',
                            key: 'active',
                        },
                        {
                            label: 'Inactivos',
                            value: inactiveCount,
                            active: filter === 'inactive',
                            key: 'inactive',
                        },
                    ].map(({ label, value, active, key }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key as typeof filter)}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm shadow-sm transition-all
                ${
                    active
                        ? 'border-primary/40 bg-primary/5 text-primary font-semibold'
                        : 'border-border/60 bg-card text-muted-foreground hover:border-primary/20 hover:text-foreground'
                }`}
                        >
                            {label}:
                            <span
                                className={`font-bold ${active ? 'text-primary' : 'text-foreground'}`}
                            >
                                {value}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* ── Buscador + Botón ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar tratamiento…"
                        className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-8 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
                <Button onClick={openAdd} className="gap-2 shrink-0">
                    <Plus className="h-4 w-4" />
                    Nuevo Tratamiento
                </Button>
            </div>

            {/* ── Tabla ── */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="font-semibold">
                                Tratamiento
                            </TableHead>
                            <TableHead className="hidden sm:table-cell font-semibold">
                                Precio
                            </TableHead>
                            <TableHead className="hidden sm:table-cell font-semibold">
                                Duración
                            </TableHead>
                            <TableHead className="font-semibold">
                                Estado
                            </TableHead>
                            <TableHead />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableSkeleton />
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="py-16 text-center"
                                >
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Stethoscope className="h-10 w-10 opacity-20" />
                                        <p className="text-sm">
                                            {search
                                                ? `Sin resultados para "${search}"`
                                                : 'No hay tratamientos registrados'}
                                        </p>
                                        {!search && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-2 gap-1.5"
                                                onClick={openAdd}
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Agregar el primero
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((t) => (
                                <TreatmentRow
                                    key={t.id}
                                    treatment={t}
                                    onEdit={openEdit}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Footer */}
                {!isLoading && filtered.length > 0 && (
                    <div className="border-t border-border/40 bg-muted/20 px-4 py-2">
                        <p className="text-xs text-muted-foreground">
                            {filtered.length} tratamiento
                            {filtered.length !== 1 ? 's' : ''}
                            {search && ` · resultados para "${search}"`}
                        </p>
                    </div>
                )}
            </div>

            {/* ── Modal ── */}
            <TreatmentModal
                open={modalOpen}
                onOpenChange={(v) => {
                    setModalOpen(v)
                    if (!v) setEditTarget(undefined)
                }}
                treatment={editTarget}
            />
        </div>
    )
}
