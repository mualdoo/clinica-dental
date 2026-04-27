'use client'

import { useState } from 'react'
import {
    Plus,
    Trash2,
    FileDown,
    CheckCircle2,
    Clock,
    XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Tratamientos disponibles (hardcoded) ─────────────────────────────────────
const TREATMENTS = [
    { id: 't1', name: 'Consulta general', price: 300 },
    { id: 't2', name: 'Limpieza dental', price: 600 },
    { id: 't3', name: 'Extracción simple', price: 800 },
    { id: 't4', name: 'Extracción quirúrgica', price: 1500 },
    { id: 't5', name: 'Endodoncia', price: 3500 },
    { id: 't6', name: 'Corona porcelana', price: 5000 },
    { id: 't7', name: 'Blanqueamiento', price: 2500 },
    { id: 't8', name: 'Ortodoncia (mensualidad)', price: 1800 },
]

// ─── Pagos hardcoded ──────────────────────────────────────────────────────────
const PAYMENTS = [
    {
        id: 'p1',
        date: '2025-03-10',
        amount: 600,
        method: 'Efectivo',
        status: 'paid',
    },
    {
        id: 'p2',
        date: '2025-03-24',
        amount: 600,
        method: 'Transferencia',
        status: 'paid',
    },
    { id: 'p3', date: '2025-04-08', amount: 0, method: '—', status: 'pending' },
]

type PaymentStatus = 'paid' | 'pending' | 'cancelled'

const STATUS_MAP: Record<
    PaymentStatus,
    { label: string; icon: React.ReactNode; className: string }
> = {
    paid: {
        label: 'Pagado',
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        className: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    pending: {
        label: 'Pendiente',
        icon: <Clock className="h-3.5 w-3.5" />,
        className: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    cancelled: {
        label: 'Cancelado',
        icon: <XCircle className="h-3.5 w-3.5" />,
        className: 'text-rose-600 bg-rose-50 border-rose-200',
    },
}

interface LineItem {
    treatmentId: string
    qty: number
}

export function TabPresupuestos({ patientId: _ }: { patientId: string }) {
    const [items, setItems] = useState<LineItem[]>([])
    const [selected, setSelected] = useState<string>('')

    const addItem = () => {
        if (!selected) return
        setItems((prev) => {
            const exists = prev.find((i) => i.treatmentId === selected)
            if (exists)
                return prev.map((i) =>
                    i.treatmentId === selected ? { ...i, qty: i.qty + 1 } : i
                )
            return [...prev, { treatmentId: selected, qty: 1 }]
        })
        setSelected('')
    }

    const removeItem = (id: string) =>
        setItems((p) => p.filter((i) => i.treatmentId !== id))

    const getTotal = () =>
        items.reduce((acc, item) => {
            const t = TREATMENTS.find((t) => t.id === item.treatmentId)
            return acc + (t?.price ?? 0) * item.qty
        }, 0)

    const totalPaid = PAYMENTS.filter((p) => p.status === 'paid').reduce(
        (a, p) => a + p.amount,
        0
    )
    const balance = getTotal() - totalPaid

    return (
        <div className="flex flex-col gap-6">
            {/* ── Generador de presupuesto ── */}
            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-foreground">
                    Generador de Presupuesto
                </h3>

                {/* Selector de tratamiento */}
                <div className="flex gap-2">
                    <select
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                        className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                    >
                        <option value="">Seleccionar tratamiento…</option>
                        {TREATMENTS.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name} — ${t.price.toLocaleString()} MXN
                            </option>
                        ))}
                    </select>
                    <Button
                        size="sm"
                        onClick={addItem}
                        disabled={!selected}
                        className="gap-1.5 shrink-0"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Agregar
                    </Button>
                </div>

                {/* Tabla de items */}
                {items.length > 0 && (
                    <div className="rounded-lg border border-border/50 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/50 bg-muted/40">
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                                        Tratamiento
                                    </th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-muted-foreground w-16">
                                        Cant.
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">
                                        Subtotal
                                    </th>
                                    <th className="w-8" />
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => {
                                    const t = TREATMENTS.find(
                                        (t) => t.id === item.treatmentId
                                    )!
                                    return (
                                        <tr
                                            key={item.treatmentId}
                                            className="border-b border-border/30 last:border-0"
                                        >
                                            <td className="px-3 py-2 text-xs text-foreground">
                                                {t.name}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() =>
                                                            setItems((p) =>
                                                                p.map((i) =>
                                                                    i.treatmentId ===
                                                                    item.treatmentId
                                                                        ? {
                                                                              ...i,
                                                                              qty: Math.max(
                                                                                  1,
                                                                                  i.qty -
                                                                                      1
                                                                              ),
                                                                          }
                                                                        : i
                                                                )
                                                            )
                                                        }
                                                        className="h-5 w-5 rounded border border-border text-xs hover:bg-muted transition-colors"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="text-xs w-4 text-center">
                                                        {item.qty}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            setItems((p) =>
                                                                p.map((i) =>
                                                                    i.treatmentId ===
                                                                    item.treatmentId
                                                                        ? {
                                                                              ...i,
                                                                              qty:
                                                                                  i.qty +
                                                                                  1,
                                                                          }
                                                                        : i
                                                                )
                                                            )
                                                        }
                                                        className="h-5 w-5 rounded border border-border text-xs hover:bg-muted transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-right text-xs font-semibold text-foreground">
                                                $
                                                {(
                                                    t.price * item.qty
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-2 py-2">
                                                <button
                                                    onClick={() =>
                                                        removeItem(
                                                            item.treatmentId
                                                        )
                                                    }
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="border-t border-border/50 bg-muted/20">
                                    <td
                                        colSpan={2}
                                        className="px-3 py-2 text-xs font-bold text-foreground"
                                    >
                                        Total
                                    </td>
                                    <td className="px-3 py-2 text-right text-sm font-bold text-foreground">
                                        ${getTotal().toLocaleString()} MXN
                                    </td>
                                    <td />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}

                {/* Botón exportar PDF */}
                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        disabled={items.length === 0}
                        onClick={() =>
                            alert(
                                'Generación de PDF — conecta tu librería aquí'
                            )
                        }
                    >
                        <FileDown className="h-3.5 w-3.5" />
                        Exportar PDF
                    </Button>
                </div>
            </div>

            {/* ── Tabla de pagos ── */}
            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-foreground">
                    Historial de Pagos
                </h3>

                <div className="rounded-lg border border-border/50 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border/50 bg-muted/40">
                                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                                    Fecha
                                </th>
                                <th className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                                    Método
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">
                                    Monto
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {PAYMENTS.map((p) => {
                                const s = STATUS_MAP[p.status as PaymentStatus]
                                return (
                                    <tr
                                        key={p.id}
                                        className="border-b border-border/30 last:border-0"
                                    >
                                        <td className="px-3 py-2 text-xs text-foreground">
                                            {p.date}
                                        </td>
                                        <td className="hidden sm:table-cell px-3 py-2 text-xs text-muted-foreground">
                                            {p.method}
                                        </td>
                                        <td className="px-3 py-2 text-right text-xs font-semibold text-foreground">
                                            {p.amount > 0
                                                ? `$${p.amount.toLocaleString()}`
                                                : '—'}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${s.className}`}
                                            >
                                                {s.icon}
                                                {s.label}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-border/50 bg-muted/20">
                                <td
                                    colSpan={2}
                                    className="px-3 py-2 text-xs text-muted-foreground"
                                >
                                    Saldo pendiente
                                </td>
                                <td
                                    colSpan={2}
                                    className="px-3 py-2 text-right text-sm font-bold text-rose-600"
                                >
                                    ${balance.toLocaleString()} MXN
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    )
}
