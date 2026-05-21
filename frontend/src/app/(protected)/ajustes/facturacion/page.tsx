'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import {
    CalendarDays,
    TrendingUp,
    CreditCard,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    RotateCcw,
    Loader2,
    Receipt,
    ChevronDown,
    BadgeDollarSign,
    Building,
    Smartphone,
    FileCheck,
    AlertCircle,
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
import { usePayments } from '@/hooks/use-billing'
import type { Payment, PaymentMethod, PaymentStatus } from '@/types/billing'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatMoney(n: number) {
    return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function toISODate(date: Date, endOfDay = false): string {
    const d = new Date(date)
    if (endOfDay) d.setHours(23, 59, 59, 999)
    else d.setHours(0, 0, 0, 0)
    return d.toISOString()
}

// ─── Configs visuales ─────────────────────────────────────────────────────────
const METHOD_CFG: Record<
    PaymentMethod,
    { label: string; icon: React.ReactNode; color: string }
> = {
    cash: {
        label: 'Efectivo',
        icon: <Wallet className="h-4 w-4" />,
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20',
    },
    card_credit: {
        label: 'T. Crédito',
        icon: <CreditCard className="h-4 w-4" />,
        color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20',
    },
    card_debit: {
        label: 'T. Débito',
        icon: <Smartphone className="h-4 w-4" />,
        color: 'text-violet-600 bg-violet-50 border-violet-200 dark:bg-violet-900/20',
    },
    transfer: {
        label: 'Transferencia',
        icon: <Building className="h-4 w-4" />,
        color: 'text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-900/20',
    },
    check: {
        label: 'Cheque',
        icon: <FileCheck className="h-4 w-4" />,
        color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20',
    },
}

const STATUS_CFG: Record<PaymentStatus, { label: string; className: string }> =
    {
        pending: {
            label: 'Pendiente',
            className: 'bg-amber-50 text-amber-700 border-amber-200',
        },
        completed: {
            label: 'Completado',
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        cancelled: {
            label: 'Cancelado',
            className: 'bg-rose-50 text-rose-700 border-rose-200',
        },
        refunded: {
            label: 'Reembolsado',
            className: 'bg-violet-50 text-violet-700 border-violet-200',
        },
    }

// ─── Selector de rango de fechas ──────────────────────────────────────────────
function DateRangePicker({
    from,
    to,
    onChange,
}: {
    from: string
    to: string
    onChange: (from: string, to: string) => void
}) {
    const [localFrom, setLocalFrom] = useState(from)
    const [localTo, setLocalTo] = useState(to)

    function apply() {
        if (localFrom && localTo) onChange(localFrom, localTo)
    }

    // Presets
    function setPreset(days: number) {
        const end = new Date()
        const start = new Date()

        const daysToSubtract = days === 1 ? 0 : days
        start.setDate(end.getDate() - daysToSubtract + 1)

        const f = start.toISOString().split('T')[0]
        const t = end.toISOString().split('T')[0]
        setLocalFrom(f)
        setLocalTo(t)
        onChange(f, t)
    }

    return (
        <div className="flex flex-wrap items-end gap-2">
            {/* Presets */}
            {[
                { label: 'Hoy', days: 1 },
                { label: '7 días', days: 7 },
                { label: '30 días', days: 30 },
            ].map(({ label, days }) => (
                <button
                    key={label}
                    onClick={() => setPreset(days)}
                    className="rounded-lg border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                >
                    {label}
                </button>
            ))}

            <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Desde
                    </label>
                    <input
                        type="date"
                        value={localFrom}
                        max={localTo}
                        onChange={(e) => setLocalFrom(e.target.value)}
                        className="h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Hasta
                    </label>
                    <input
                        type="date"
                        value={localTo}
                        min={localFrom}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setLocalTo(e.target.value)}
                        className="h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                </div>
                <Button size="sm" className="self-end gap-1.5" onClick={apply}>
                    <CalendarDays className="h-3.5 w-3.5" />
                    Aplicar
                </Button>
            </div>
        </div>
    )
}

// ─── Modal de corte de caja ───────────────────────────────────────────────────
function CorteDeCajaModal({
    open,
    onOpenChange,
    payments,
    fromDate,
    toDate,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    payments: Payment[]
    fromDate: string
    toDate: string
}) {
    const completed = payments.filter((p) => p.status === 'completed')
    const refunded = payments.filter((p) => p.status === 'refunded')
    const pending = payments.filter((p) => p.status === 'pending')

    // Convertir p.amount a número antes de sumarlo al acumulador (a)
    const totalCobrado = completed.reduce(
        (a, p) => a + (Number(p.amount) || 0),
        0
    )
    const totalReembolsos = refunded.reduce(
        (a, p) => a + (Number(p.amount) || 0),
        0
    )
    const totalPendiente = pending.reduce(
        (a, p) => a + (Number(p.amount) || 0),
        0
    )

    const neto = totalCobrado - totalReembolsos

    // Desglose por método — solo pagos completados
    const byMethod = Object.entries(METHOD_CFG)
        .map(([method, cfg]) => {
            const methodPayments = completed.filter(
                (p) => p.method === (method as PaymentMethod)
            )
            const total = methodPayments.reduce(
                (a, p) => a + (Number(p.amount) || 0),
                0
            )
            return {
                method: method as PaymentMethod,
                cfg,
                total,
                count: methodPayments.length,
            }
        })
        .filter(({ total }) => total > 0)

    const formatRange = () => {
        const f = new Date(fromDate).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        const t = new Date(toDate).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        return fromDate === toDate ? f : `${f} — ${t}`
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-1">
                        <BadgeDollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-lg">Corte de Caja</DialogTitle>
                    <DialogDescription className="capitalize">
                        {formatRange()}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    {/* Totales principales */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            {
                                label: 'Total Cobrado',
                                value: formatMoney(totalCobrado),
                                sub: `${completed.length} pago${completed.length !== 1 ? 's' : ''}`,
                                icon: <ArrowUpRight className="h-4 w-4" />,
                                color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20',
                            },
                            {
                                label: 'Reembolsos',
                                value: formatMoney(totalReembolsos),
                                sub: `${refunded.length} reembolso${refunded.length !== 1 ? 's' : ''}`,
                                icon: <ArrowDownRight className="h-4 w-4" />,
                                color: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/20',
                            },
                            {
                                label: 'Pendiente de cobro',
                                value: formatMoney(totalPendiente),
                                sub: `${pending.length} pago${pending.length !== 1 ? 's' : ''} pendiente${pending.length !== 1 ? 's' : ''}`,
                                icon: <AlertCircle className="h-4 w-4" />,
                                color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20',
                            },
                            {
                                label: 'Neto del período',
                                value: formatMoney(neto),
                                sub: 'cobrado − reembolsos',
                                icon: <TrendingUp className="h-4 w-4" />,
                                color:
                                    neto >= 0
                                        ? 'text-primary bg-primary/5 border-primary/20'
                                        : 'text-rose-600 bg-rose-50 border-rose-200',
                            },
                        ].map(({ label, value, sub, icon, color }) => (
                            <div
                                key={label}
                                className={`flex flex-col gap-1.5 rounded-xl border p-3.5 ${color}`}
                            >
                                <div className="flex items-center gap-1.5 text-xs font-semibold opacity-80">
                                    {icon}
                                    {label}
                                </div>
                                <p className="text-lg font-bold leading-tight">
                                    {value}
                                </p>
                                <p className="text-[10px] opacity-60">{sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Desglose por método */}
                    {byMethod.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Desglose por método de pago
                            </p>
                            <div className="rounded-xl border border-border/60 overflow-hidden">
                                {byMethod.map(
                                    ({ method, cfg, total, count }, i) => (
                                        <div
                                            key={method}
                                            className={`flex items-center justify-between px-4 py-3 gap-3
                      ${i !== byMethod.length - 1 ? 'border-b border-border/40' : ''}`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${cfg.color}`}
                                                >
                                                    {cfg.icon}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {cfg.label}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        {count} transacción
                                                        {count !== 1
                                                            ? 'es'
                                                            : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-foreground">
                                                {formatMoney(total)}
                                            </p>
                                        </div>
                                    )
                                )}
                                {/* Total */}
                                <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-t border-border/60">
                                    <p className="text-sm font-bold text-foreground">
                                        Total cobrado
                                    </p>
                                    <p className="text-sm font-bold text-emerald-600">
                                        {formatMoney(totalCobrado)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Nota */}
                    <p className="text-[11px] text-muted-foreground text-center">
                        Corte generado el{' '}
                        {new Date().toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Fila de pago ─────────────────────────────────────────────────────────────
function PaymentRow({ payment }: { payment: Payment }) {
    const method = METHOD_CFG[payment.method]
    const status = STATUS_CFG[payment.status]

    return (
        <div className="group flex items-center gap-3 px-4 py-3.5 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
            {/* Icono método */}
            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${method.color}`}
            >
                {method.icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">
                        {method.label}
                    </span>
                    <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 font-semibold ${status.className}`}
                    >
                        {status.label}
                    </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                    {payment.reference && (
                        <span className="font-mono">
                            Ref: {payment.reference}
                        </span>
                    )}
                    <span>
                        Presupuesto #{payment.quoteId.slice(-6).toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Monto */}
            <div className="text-right shrink-0">
                <p
                    className={`text-sm font-bold ${
                        payment.status === 'refunded'
                            ? 'text-rose-600'
                            : payment.status === 'completed'
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                    }`}
                >
                    {payment.status === 'refunded' ? '−' : ''}
                    {formatMoney(payment.amount)}
                </p>
            </div>
        </div>
    )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PaymentSkeleton() {
    return (
        <div className="flex flex-col">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40"
                >
                    <div className="h-9 w-9 rounded-lg bg-muted animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-32 rounded bg-muted animate-pulse" />
                        <div className="h-3 w-48 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                </div>
            ))}
        </div>
    )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function CorteCajaPage() {
    // Rango por defecto: hoy
    const todayStr = new Date().toISOString().split('T')[0]
    const [fromDate, setFromDate] = useState(todayStr)
    const [toDate, setToDate] = useState(todayStr)
    const [corteOpen, setCorteOpen] = useState(false)

    const loaderRef = useRef<HTMLDivElement>(null)

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        usePayments({})

    // Scroll infinito
    useEffect(() => {
        const el = loaderRef.current
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

    const allPayments: Payment[] = data?.pages.flatMap((p) => p.data.data) ?? []

    // Filtra por rango de fechas seleccionado para el corte
    const paymentsInRange = useMemo(() => {
        const start = new Date(fromDate + 'T00:00:00')
        const end = new Date(toDate + 'T23:59:59')
        return allPayments.filter((p) => {
            const d = new Date(p.createdAt) // usa createdAt si lo tienes
            return d >= start && d <= end
        })
    }, [allPayments, fromDate, toDate])

    // Stats del rango seleccionado para el header
    const stats = useMemo(() => {
        const completed = paymentsInRange.filter(
            (p) => p.status === 'completed'
        )
        const refunded = paymentsInRange.filter((p) => p.status === 'refunded')
        return {
            total: completed.reduce((a, p) => a + (Number(p.amount) || 0), 0),
            refunded: refunded.reduce((a, p) => a + (Number(p.amount) || 0), 0),
            count: completed.length,
        }
    }, [paymentsInRange])

    function handleRangeChange(from: string, to: string) {
        setFromDate(from)
        setToDate(to)
    }

    const isToday = fromDate === todayStr && toDate === todayStr

    return (
        <div className="flex flex-col gap-5">
            {/* ── Encabezado ── */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Corte de Caja
                </h1>
                <p className="text-sm text-muted-foreground">
                    Registro de pagos y cierre del período
                </p>
            </div>

            {/* ── Selector de fechas ── */}
            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Período de consulta
                </p>
                <DateRangePicker
                    from={fromDate}
                    to={toDate}
                    onChange={handleRangeChange}
                />
            </div>

            {/* ── Stats del período ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                    {
                        label: 'Total cobrado',
                        value: formatMoney(stats.total),
                        sub: `${stats.count} pago${stats.count !== 1 ? 's' : ''} completado${stats.count !== 1 ? 's' : ''}`,
                        icon: (
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                        ),
                        valueClass: 'text-emerald-600',
                    },
                    {
                        label: 'Reembolsos',
                        value: formatMoney(stats.refunded),
                        sub: 'del período',
                        icon: <RotateCcw className="h-4 w-4 text-rose-600" />,
                        valueClass:
                            stats.refunded > 0
                                ? 'text-rose-600'
                                : 'text-muted-foreground',
                    },
                    {
                        label: 'Neto',
                        value: formatMoney(stats.total - stats.refunded),
                        sub: 'cobrado − reembolsos',
                        icon: (
                            <BadgeDollarSign className="h-4 w-4 text-primary" />
                        ),
                        valueClass: 'text-primary',
                    },
                ].map(({ label, value, sub, icon, valueClass }) => (
                    <div
                        key={label}
                        className="rounded-xl border border-border/60 bg-card p-4 shadow-sm flex flex-col gap-2"
                    >
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            {icon}
                            {label}
                        </div>
                        <p
                            className={`text-xl font-bold leading-tight ${valueClass}`}
                        >
                            {value}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                            {sub}
                        </p>
                    </div>
                ))}
            </div>

            {/* ── Tabla de pagos + botón corte ── */}
            <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
                {/* Header de la tabla */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/40">
                    <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-semibold text-foreground">
                            Pagos
                            {!isToday && (
                                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                    — filtrando por rango seleccionado
                                </span>
                            )}
                        </p>
                    </div>

                    <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setCorteOpen(true)}
                        // disabled={paymentsInRange.length === 0}
                    >
                        <BadgeDollarSign className="h-3.5 w-3.5" />
                        Ver corte
                    </Button>
                </div>

                {/* Lista */}
                {isLoading ? (
                    <PaymentSkeleton />
                ) : allPayments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                        <Receipt className="h-10 w-10 opacity-20" />
                        <p className="text-sm">Sin pagos registrados</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {/* Muestra todos los pagos cargados — el filtro es solo para el corte */}
                        {allPayments.map((p) => (
                            <PaymentRow key={p.id} payment={p} />
                        ))}
                    </div>
                )}

                {/* Footer con scroll infinito */}
                <div
                    ref={loaderRef}
                    className="flex justify-center py-3 border-t border-border/40"
                >
                    {isFetchingNextPage ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Cargando más pagos…
                        </div>
                    ) : hasNextPage ? (
                        <button
                            onClick={() => fetchNextPage()}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ChevronDown className="h-3.5 w-3.5" />
                            Cargar más
                        </button>
                    ) : allPayments.length > 0 ? (
                        <p className="text-xs text-muted-foreground">
                            {allPayments.length} pago
                            {allPayments.length !== 1 ? 's' : ''} en total
                        </p>
                    ) : null}
                </div>
            </div>

            {/* ── Modal de corte ── */}
            <CorteDeCajaModal
                open={corteOpen}
                onOpenChange={setCorteOpen}
                payments={paymentsInRange}
                fromDate={fromDate}
                toDate={toDate}
            />
        </div>
    )
}
