'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import {
    Plus,
    Package,
    Building2,
    ArrowUpDown,
    ShoppingCart,
    Search,
    X,
    MoreVertical,
    Pencil,
    Trash2,
    AlertTriangle,
    ChevronDown,
    Loader2,
    ArrowUp,
    ArrowDown,
    Settings2,
    CheckCircle2,
    XCircle,
    Send,
    ClipboardCheck,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
    SupplierForm,
    type SupplierFormValues,
} from '@/components/inventory/supplier-form'
import { ItemForm, type ItemFormValues } from '@/components/inventory/item-form'
import {
    MovementForm,
    type MovementFormValues,
} from '@/components/inventory/movement-form'
import {
    useSuppliers,
    useCreateSupplier,
    usePatchSupplier,
    useDeleteSupplier,
    useItems,
    useCreateItem,
    usePatchItem,
    useDeleteItem,
    useMovements,
    useCreateMovement,
    useOrders,
    useCreateOrder,
    usePatchOrderStatus,
    getValidTransitions,
} from '@/hooks/use-inventory'
import type {
    Supplier,
    Item,
    StockMovement,
    PurchaseOrder,
    OrderStatus,
    MovementType,
} from '@/types/inventory'
import { Input } from '@/components/ui/input'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatMoney(n: number) {
    return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

function isLowStock(item: Item) {
    return item.stockCurrent <= item.stockMinimum
}

function isExpiringSoon(item: Item, days = 30) {
    if (!item.expiryDate) return false
    const diff = new Date(item.expiryDate).getTime() - Date.now()
    return diff > 0 && diff < days * 86400000
}

// ─── Configs ──────────────────────────────────────────────────────────────────
const ORDER_STATUS_CFG: Record<
    OrderStatus,
    { label: string; className: string; icon: React.ReactNode }
> = {
    draft: {
        label: 'Borrador',
        className: 'bg-slate-100 text-slate-600 border-slate-200',
        icon: <Settings2 className="h-3 w-3" />,
    },
    sent: {
        label: 'Enviada',
        className: 'bg-sky-100 text-sky-700 border-sky-200',
        icon: <Send className="h-3 w-3" />,
    },
    confirmed: {
        label: 'Confirmada',
        className: 'bg-violet-100 text-violet-700 border-violet-200',
        icon: <ClipboardCheck className="h-3 w-3" />,
    },
    received: {
        label: 'Recibida',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: <CheckCircle2 className="h-3 w-3" />,
    },
    cancelled: {
        label: 'Cancelada',
        className: 'bg-rose-100 text-rose-700 border-rose-200',
        icon: <XCircle className="h-3 w-3" />,
    },
}

const MOVEMENT_TYPE_CFG: Record<
    MovementType,
    { label: string; icon: React.ReactNode; className: string }
> = {
    compra: {
        label: 'Compra',
        icon: <ArrowUp className="h-3.5 w-3.5" />,
        className: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    consumo: {
        label: 'Consumo',
        icon: <ArrowDown className="h-3.5 w-3.5" />,
        className: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    ajuste: {
        label: 'Ajuste',
        icon: <Settings2 className="h-3.5 w-3.5" />,
        className: 'text-amber-600 bg-amber-50 border-amber-200',
    },
}

// ─── Buscador reutilizable ────────────────────────────────────────────────────
function SearchInput({
    value,
    onChange,
    placeholder,
}: {
    value: string
    onChange: (v: string) => void
    placeholder: string
}) {
    return (
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-8 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    )
}

// ─── Skeleton genérico ────────────────────────────────────────────────────────
function TableSkeleton({ cols = 4 }: { cols?: number }) {
    return (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    {Array.from({ length: cols }).map((_, j) => (
                        <TableCell key={j}>
                            <div
                                className="h-4 rounded bg-muted animate-pulse"
                                style={{ width: `${60 + j * 15}%` }}
                            />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    )
}

// ─── Loader infinito ──────────────────────────────────────────────────────────
function InfiniteLoader({
    loaderRef,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    total,
}: {
    loaderRef: React.RefObject<HTMLDivElement>
    isFetchingNextPage: boolean
    hasNextPage: boolean | undefined
    fetchNextPage: () => void
    total: number
}) {
    return (
        <div
            ref={loaderRef}
            className="flex justify-center py-3 border-t border-border/40"
        >
            {isFetchingNextPage ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Cargando…
                </div>
            ) : hasNextPage ? (
                <button
                    onClick={fetchNextPage}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                    <ChevronDown className="h-3.5 w-3.5" />
                    Cargar más
                </button>
            ) : (
                <p className="text-xs text-muted-foreground">
                    {total} registro{total !== 1 ? 's' : ''}
                </p>
            )}
        </div>
    )
}

function useInfiniteScroll(
    hasNextPage: boolean | undefined,
    fetchNextPage: () => void
): React.RefObject<HTMLDivElement> {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) fetchNextPage()
            },
            { threshold: 0.5 }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [hasNextPage, fetchNextPage])
    return ref as React.RefObject<HTMLDivElement>
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: ARTÍCULOS
// ══════════════════════════════════════════════════════════════════════════════
function TabArticulos() {
    const [search, setSearch] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<Item | undefined>()
    const [movTarget, setMovTarget] = useState<Item | undefined>()
    const [orderTarget, setOrderTarget] = useState<Item | undefined>()
    const [filterLow, setFilterLow] = useState(false)

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useItems(filterLow ? { lowStock: true } : {})
    const { mutate: createItem } = useCreateItem()
    const { mutate: patchItem } = usePatchItem()
    const { mutate: deleteItem } = useDeleteItem()
    const { mutate: createMov, isPending: movPending } = useCreateMovement(
        movTarget?.id ?? ''
    )
    const { mutate: createOrder, isPending: orderPending } = useCreateOrder(
        orderTarget?.id ?? ''
    )

    const loaderRef = useInfiniteScroll(hasNextPage, fetchNextPage)
    const allItems: Item[] = data?.pages.flatMap((p) => p.data.data) ?? []
    const filtered = useMemo(
        () =>
            allItems.filter((i) =>
                i.name.toLowerCase().includes(search.toLowerCase())
            ),
        [allItems, search]
    )

    const lowCount = allItems.filter(isLowStock).length

    function handleMovSubmit(values: MovementFormValues) {
        if (!movTarget) return
        createMov(values, { onSuccess: () => setMovTarget(undefined) })
    }

    const orderSchema = z.object({
        quantity: z
            .number('Ingresa una cantidad válida')
            .min(1, 'La cantidad debe ser al menos 1'),
    })

    type OrderFormValues = z.infer<typeof orderSchema>

    function handleOrderSubmit(values: OrderFormValues) {
        if (!orderTarget) return
        createOrder(
            {
                quantity: values.quantity,
            },
            {
                onSuccess: () => setOrderTarget(undefined),
            }
        )
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<OrderFormValues>({
        resolver: zodResolver(orderSchema),
        defaultValues: { quantity: 1 },
    })

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Buscar artículo…"
                />
                <button
                    onClick={() => setFilterLow((f) => !f)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors
            ${
                filterLow
                    ? 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/20'
                    : 'border-border/60 bg-card text-muted-foreground hover:text-foreground'
            }`}
                >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Stock bajo {lowCount > 0 && `(${lowCount})`}
                </button>
                <Button
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={() => {
                        setEditTarget(undefined)
                        setModalOpen(true)
                    }}
                >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar artículo
                </Button>
            </div>

            {/* Tabla */}
            <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="font-semibold">
                                Artículo
                            </TableHead>
                            <TableHead className="hidden sm:table-cell font-semibold">
                                Stock
                            </TableHead>
                            <TableHead className="hidden md:table-cell font-semibold">
                                Costo
                            </TableHead>
                            <TableHead className="hidden lg:table-cell font-semibold">
                                Ubicación
                            </TableHead>
                            <TableHead className="hidden lg:table-cell font-semibold">
                                Caducidad
                            </TableHead>
                            <TableHead />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableSkeleton cols={6} />
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="py-16 text-center text-sm text-muted-foreground"
                                >
                                    {search
                                        ? `Sin resultados para "${search}"`
                                        : 'Sin artículos registrados'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((item) => (
                                <TableRow key={item.id} className="group">
                                    <TableCell>
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                      ${isLowStock(item) ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}`}
                                            >
                                                <Package className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground sm:hidden">
                                                    {item.stockCurrent}/
                                                    {item.stockMinimum}{' '}
                                                    {item.unit}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-sm font-semibold ${isLowStock(item) ? 'text-amber-600' : 'text-foreground'}`}
                                            >
                                                {item.stockCurrent}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                / mín {item.stockMinimum}{' '}
                                                {item.unit}
                                            </span>
                                            {isLowStock(item) && (
                                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <span className="text-sm text-foreground">
                                            {formatMoney(item.unitCost)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        <span className="text-xs text-muted-foreground">
                                            {item.location}
                                        </span>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        {item.expiryDate ? (
                                            <span
                                                className={`text-xs ${isExpiringSoon(item) ? 'text-amber-600 font-semibold' : 'text-muted-foreground'}`}
                                            >
                                                {formatDate(item.expiryDate)}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                —
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 ml-auto">
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="w-48"
                                            >
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setEditTarget(item)
                                                        setModalOpen(true)
                                                    }}
                                                    className="gap-2 cursor-pointer"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        setMovTarget(item)
                                                    }
                                                    className="gap-2 cursor-pointer"
                                                >
                                                    <ArrowUpDown className="h-3.5 w-3.5" />
                                                    Registrar movimiento
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        setOrderTarget(item)
                                                    }
                                                    className="gap-2 cursor-pointer"
                                                >
                                                    <ShoppingCart className="h-3.5 w-3.5" />
                                                    Crear orden de compra
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                `¿Eliminar "${item.name}"?`
                                                            )
                                                        )
                                                            deleteItem(item.id)
                                                    }}
                                                    className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <InfiniteLoader
                    loaderRef={loaderRef}
                    isFetchingNextPage={isFetchingNextPage}
                    hasNextPage={hasNextPage}
                    fetchNextPage={fetchNextPage}
                    total={filtered.length}
                />
            </div>

            {/* Modal add/edit artículo */}
            <Dialog
                open={modalOpen}
                onOpenChange={(v) => {
                    setModalOpen(v)
                    if (!v) setEditTarget(undefined)
                }}
            >
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editTarget ? 'Editar artículo' : 'Nuevo artículo'}
                        </DialogTitle>
                        <DialogDescription>
                            {editTarget
                                ? 'Modifica los datos del artículo.'
                                : 'Completa los datos para agregar un artículo al inventario.'}
                        </DialogDescription>
                    </DialogHeader>
                    <ItemForm
                        initialData={editTarget}
                        isLoading={false}
                        onSubmit={(values) => {
                            if (editTarget) {
                                patchItem(
                                    { id: editTarget.id, dto: values },
                                    { onSuccess: () => setModalOpen(false) }
                                )
                            } else {
                                createItem(
                                    {
                                        supplierId: values.supplierId,
                                        dto: values,
                                    },
                                    { onSuccess: () => setModalOpen(false) }
                                )
                            }
                        }}
                        onCancel={() => setModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Modal movimiento */}
            <Dialog
                open={!!movTarget}
                onOpenChange={(v) => {
                    if (!v) setMovTarget(undefined)
                }}
            >
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Registrar Movimiento</DialogTitle>
                        <DialogDescription>
                            El movimiento actualiza el stock automáticamente.
                        </DialogDescription>
                    </DialogHeader>
                    {movTarget && (
                        <MovementForm
                            itemName={movTarget.name}
                            isLoading={movPending}
                            onSubmit={handleMovSubmit}
                            onCancel={() => setMovTarget(undefined)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal orden de compra rápida */}
            <Dialog
                open={!!orderTarget}
                onOpenChange={(v) => {
                    if (!v) setOrderTarget(undefined)
                }}
            >
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Crear Orden de Compra</DialogTitle>
                        <DialogDescription>
                            Se creará una orden para reponer el stock de este
                            artículo.
                        </DialogDescription>
                    </DialogHeader>
                    {orderTarget && (
                        <div className="flex flex-col gap-4 py-2">
                            <form onSubmit={handleSubmit(handleOrderSubmit)}>
                                <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3 flex flex-col gap-2">
                                    <p className="text-sm font-semibold">
                                        {orderTarget.name}
                                    </p>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Stock actual</span>
                                        <span className="font-semibold text-amber-600">
                                            {orderTarget.stockCurrent}{' '}
                                            {orderTarget.unit}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Stock mínimo</span>
                                        <span>
                                            {orderTarget.stockMinimum}{' '}
                                            {orderTarget.unit}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span>Cantidad sugerida</span>
                                        <span className="text-primary">
                                            {Math.max(
                                                1,
                                                orderTarget.stockMinimum -
                                                    orderTarget.stockCurrent +
                                                    1
                                            )}{' '}
                                            {orderTarget.unit}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-semibold">
                                        <span>Cantidad:</span>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            min={1}
                                            {...register('quantity', {
                                                valueAsNumber: true,
                                            })}
                                            className={`w-24 h-7 px-2 py-1 text-xs text-right ${
                                                errors.quantity
                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                    : ''
                                            }`}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() =>
                                            setOrderTarget(undefined)
                                        }
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 gap-2"
                                        disabled={orderPending}
                                    >
                                        {orderPending && (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        )}
                                        Crear orden
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: PROVEEDORES
// ══════════════════════════════════════════════════════════════════════════════
function TabProveedores() {
    const [search, setSearch] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<Supplier | undefined>()

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useSuppliers()
    const { mutate: create, isPending: creating } = useCreateSupplier()
    const { mutate: patch, isPending: patching } = usePatchSupplier()
    const { mutate: remove } = useDeleteSupplier()

    const loaderRef = useInfiniteScroll(hasNextPage, fetchNextPage)
    const all: Supplier[] = data?.pages.flatMap((p) => p.data.data) ?? []
    const filtered = useMemo(
        () =>
            all.filter((s) =>
                s.name.toLowerCase().includes(search.toLowerCase())
            ),
        [all, search]
    )

    const isPending = creating || patching

    function handleSubmit(values: SupplierFormValues) {
        if (editTarget) {
            patch(
                { id: editTarget.id, dto: values },
                { onSuccess: () => setModalOpen(false) }
            )
        } else {
            create(values, { onSuccess: () => setModalOpen(false) })
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Buscar proveedor…"
                />
                <Button
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={() => {
                        setEditTarget(undefined)
                        setModalOpen(true)
                    }}
                >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar
                </Button>
            </div>

            <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="font-semibold">
                                Proveedor
                            </TableHead>
                            <TableHead className="hidden sm:table-cell font-semibold">
                                Correo
                            </TableHead>
                            <TableHead className="hidden md:table-cell font-semibold">
                                Teléfono
                            </TableHead>
                            <TableHead className="hidden lg:table-cell font-semibold">
                                Dirección
                            </TableHead>
                            <TableHead />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableSkeleton cols={5} />
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="py-16 text-center text-sm text-muted-foreground"
                                >
                                    Sin proveedores registrados
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((s) => (
                                <TableRow key={s.id} className="group">
                                    <TableCell>
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Building2 className="h-4 w-4" />
                                            </div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {s.name}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                                        {s.email}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                        {s.phone ?? '—'}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground truncate max-w-50">
                                        {s.address}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 ml-auto">
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="w-40"
                                            >
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setEditTarget(s)
                                                        setModalOpen(true)
                                                    }}
                                                    className="gap-2 cursor-pointer"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                `¿Eliminar "${s.name}"?`
                                                            )
                                                        )
                                                            remove(s.id)
                                                    }}
                                                    className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <InfiniteLoader
                    loaderRef={loaderRef}
                    isFetchingNextPage={isFetchingNextPage}
                    hasNextPage={hasNextPage}
                    fetchNextPage={fetchNextPage}
                    total={filtered.length}
                />
            </div>

            <Dialog
                open={modalOpen}
                onOpenChange={(v) => {
                    setModalOpen(v)
                    if (!v) setEditTarget(undefined)
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editTarget
                                ? 'Editar proveedor'
                                : 'Nuevo proveedor'}
                        </DialogTitle>
                        <DialogDescription>
                            {editTarget
                                ? 'Modifica los datos del proveedor.'
                                : 'Completa los datos del proveedor.'}
                        </DialogDescription>
                    </DialogHeader>
                    <SupplierForm
                        initialData={editTarget}
                        isLoading={isPending}
                        onSubmit={handleSubmit}
                        onCancel={() => setModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: MOVIMIENTOS
// ══════════════════════════════════════════════════════════════════════════════
function TabMovimientos() {
    const [typeFilter, setTypeFilter] = useState<MovementType | 'all'>('all')

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useMovements(typeFilter !== 'all' ? { type: typeFilter } : {})

    const loaderRef = useInfiniteScroll(hasNextPage, fetchNextPage)
    const movements: StockMovement[] =
        data?.pages.flatMap((p) => p.data.data) ?? []

    return (
        <div className="flex flex-col gap-4">
            {/* Filtro por tipo */}
            <div className="flex flex-wrap gap-2">
                {(
                    [
                        { value: 'all', label: 'Todos' },
                        { value: 'compra', label: 'Compras' },
                        { value: 'consumo', label: 'Consumos' },
                        { value: 'ajuste', label: 'Ajustes' },
                    ] as const
                ).map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => setTypeFilter(value)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors
              ${
                  typeFilter === value
                      ? 'border-primary/40 bg-primary/5 text-primary'
                      : 'border-border/60 bg-card text-muted-foreground hover:text-foreground'
              }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="font-semibold">
                                Tipo
                            </TableHead>
                            <TableHead className="hidden sm:table-cell font-semibold">
                                Artículo
                            </TableHead>
                            <TableHead className="font-semibold">
                                Cantidad
                            </TableHead>
                            <TableHead className="hidden md:table-cell font-semibold">
                                Motivo
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableSkeleton cols={4} />
                        ) : movements.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="py-16 text-center text-sm text-muted-foreground"
                                >
                                    Sin movimientos registrados
                                </TableCell>
                            </TableRow>
                        ) : (
                            movements.map((m) => {
                                const cfg = MOVEMENT_TYPE_CFG[m.type]
                                return (
                                    <TableRow key={m.id}>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`gap-1 text-[11px] font-semibold ${cfg.className}`}
                                            >
                                                {cfg.icon}
                                                {cfg.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground font-mono">
                                            #{m.itemId.slice(-6)}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`text-sm font-bold
                      ${m.type === 'compra' ? 'text-emerald-600' : m.type === 'consumo' ? 'text-rose-600' : 'text-amber-600'}`}
                                            >
                                                {m.type === 'consumo'
                                                    ? '-'
                                                    : m.type === 'compra'
                                                      ? '+'
                                                      : ''}
                                                {m.quantity}
                                            </span>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                                            {m.reason ?? '—'}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
                <InfiniteLoader
                    loaderRef={loaderRef}
                    isFetchingNextPage={isFetchingNextPage}
                    hasNextPage={hasNextPage}
                    fetchNextPage={fetchNextPage}
                    total={movements.length}
                />
            </div>
        </div>
    )
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: ÓRDENES DE COMPRA
// ══════════════════════════════════════════════════════════════════════════════
function TabOrdenes() {
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useOrders(statusFilter !== 'all' ? { status: statusFilter } : {})
    const { mutate: patchStatus, isPending } = usePatchOrderStatus()

    const loaderRef = useInfiniteScroll(hasNextPage, fetchNextPage)
    const orders: PurchaseOrder[] =
        data?.pages.flatMap((p) => p.data.data) ?? []

    return (
        <div className="flex flex-col gap-4">
            {/* Filtro por status */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setStatusFilter('all')}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors
            ${
                statusFilter === 'all'
                    ? 'border-primary/40 bg-primary/5 text-primary'
                    : 'border-border/60 bg-card text-muted-foreground hover:text-foreground'
            }`}
                >
                    Todas
                </button>
                {(Object.keys(ORDER_STATUS_CFG) as OrderStatus[]).map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors
              ${
                  statusFilter === s
                      ? 'border-primary/40 bg-primary/5 text-primary'
                      : 'border-border/60 bg-card text-muted-foreground hover:text-foreground'
              }`}
                    >
                        {ORDER_STATUS_CFG[s].label}
                    </button>
                ))}
            </div>

            <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="font-semibold">
                                Estado
                            </TableHead>
                            <TableHead className="hidden sm:table-cell font-semibold">
                                Artículo
                            </TableHead>
                            <TableHead className="font-semibold">
                                Cantidad
                            </TableHead>
                            <TableHead className="hidden md:table-cell font-semibold">
                                Total
                            </TableHead>
                            <TableHead className="font-semibold">
                                Acción
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableSkeleton cols={5} />
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="py-16 text-center text-sm text-muted-foreground"
                                >
                                    Sin órdenes de compra
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => {
                                const cfg = ORDER_STATUS_CFG[order.status]
                                const transitions = getValidTransitions(
                                    order.status
                                )
                                return (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`gap-1 text-[11px] font-semibold ${cfg.className}`}
                                            >
                                                {cfg.icon}
                                                {cfg.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground font-mono">
                                            #{order.itemId.slice(-6)}
                                        </TableCell>
                                        <TableCell className="text-sm font-semibold text-foreground">
                                            {order.quantity}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm font-semibold text-foreground">
                                            {formatMoney(order.totalAmount)}
                                        </TableCell>
                                        <TableCell>
                                            {transitions.length > 0 ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-1 h-7 text-xs"
                                                            disabled={isPending}
                                                        >
                                                            Cambiar estado
                                                            <ChevronDown className="h-3 w-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-40"
                                                    >
                                                        {transitions.map(
                                                            (t) => (
                                                                <DropdownMenuItem
                                                                    key={t}
                                                                    onClick={() =>
                                                                        patchStatus(
                                                                            {
                                                                                id: order.id,
                                                                                dto: {
                                                                                    status: t,
                                                                                },
                                                                            }
                                                                        )
                                                                    }
                                                                    className="gap-2 cursor-pointer text-xs"
                                                                >
                                                                    {
                                                                        ORDER_STATUS_CFG[
                                                                            t
                                                                        ].icon
                                                                    }
                                                                    {
                                                                        ORDER_STATUS_CFG[
                                                                            t
                                                                        ].label
                                                                    }
                                                                </DropdownMenuItem>
                                                            )
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
                <InfiniteLoader
                    loaderRef={loaderRef}
                    isFetchingNextPage={isFetchingNextPage}
                    hasNextPage={hasNextPage}
                    fetchNextPage={fetchNextPage}
                    total={orders.length}
                />
            </div>
        </div>
    )
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function InventarioPage() {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Inventario
                </h1>
                <p className="text-sm text-muted-foreground">
                    Gestión de artículos, proveedores y órdenes de compra
                </p>
            </div>

            <Tabs defaultValue="articulos">
                <TabsList className="w-full sm:w-fit">
                    <TabsTrigger
                        value="articulos"
                        className="gap-1.5 flex-1 sm:flex-none"
                    >
                        <Package className="h-3.5 w-3.5" />
                        Artículos
                    </TabsTrigger>
                    <TabsTrigger
                        value="proveedores"
                        className="gap-1.5 flex-1 sm:flex-none"
                    >
                        <Building2 className="h-3.5 w-3.5" />
                        Proveedores
                    </TabsTrigger>
                    <TabsTrigger
                        value="movimientos"
                        className="gap-1.5 flex-1 sm:flex-none"
                    >
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        Movimientos
                    </TabsTrigger>
                    <TabsTrigger
                        value="ordenes"
                        className="gap-1.5 flex-1 sm:flex-none"
                    >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Órdenes
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="articulos" className="mt-5">
                    <TabArticulos />
                </TabsContent>
                <TabsContent value="proveedores" className="mt-5">
                    <TabProveedores />
                </TabsContent>
                <TabsContent value="movimientos" className="mt-5">
                    <TabMovimientos />
                </TabsContent>
                <TabsContent value="ordenes" className="mt-5">
                    <TabOrdenes />
                </TabsContent>
            </Tabs>
        </div>
    )
}
