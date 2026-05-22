'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Plus,
    Trash2,
    FileDown,
    ChevronDown,
    ChevronUp,
    Loader2,
    ReceiptText,
    CreditCard,
    Clock,
    CheckCircle2,
    XCircle,
    RotateCcw,
    BadgeDollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    useQuotesByPatient,
    useQuoteItems,
    useQuotePayments,
    useCreateQuote,
    usePatchQuote,
    useDeleteQuote,
    useCreateQuoteItem,
    useDeleteQuoteItem,
    useCreatePayment,
    useGenerateQuotePdf,
} from '@/hooks/use-billing'
import { useTreatments } from '@/hooks/use-billing'
import type {
    Quote,
    QuoteItem,
    Payment,
    QuoteStatus,
    PaymentStatus,
    PaymentMethod,
    PatientQuote,
    PatientItem,
    Treatment,
} from '@/types/billing'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/auth-store'

// ─── Configs visuales ─────────────────────────────────────────────────────────
const QUOTE_STATUS_CFG: Record<
    QuoteStatus,
    { label: string; className: string }
> = {
    draft: {
        label: 'Borrador',
        className:
            'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
    },
    sent: {
        label: 'Enviado',
        className:
            'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300',
    },
    accepted: {
        label: 'Aceptado',
        className:
            'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    rejected: {
        label: 'Rechazado',
        className:
            'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300',
    },
    expired: {
        label: 'Expirado',
        className:
            'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300',
    },
    paid: {
        label: 'Pagado',
        className:
            'bg-indigo-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
    },
}

const PAYMENT_STATUS_CFG: Record<
    PaymentStatus,
    { label: string; icon: React.ReactNode; className: string }
> = {
    pending: {
        label: 'Pendiente',
        icon: <Clock className="h-3 w-3" />,
        className: 'bg-amber-100   text-amber-700   border-amber-200',
    },
    completed: {
        label: 'Completado',
        icon: <CheckCircle2 className="h-3 w-3" />,
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    cancelled: {
        label: 'Cancelado',
        icon: <XCircle className="h-3 w-3" />,
        className: 'bg-rose-100    text-rose-700    border-rose-200',
    },
    refunded: {
        label: 'Reembolsado',
        icon: <RotateCcw className="h-3 w-3" />,
        className: 'bg-violet-100  text-violet-700  border-violet-200',
    },
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    cash: 'Efectivo',
    card_credit: 'T. Crédito',
    card_debit: 'T. Débito',
    transfer: 'Transferencia',
    check: 'Cheque',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

function formatMoney(n: number) {
    return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

function getTodayString() {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

// ─── Badge de estado ──────────────────────────────────────────────────────────
function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
    const cfg = QUOTE_STATUS_CFG[status]
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.className}`}
        >
            {cfg.label}
        </span>
    )
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
    const cfg = PAYMENT_STATUS_CFG[status]
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cfg.className}`}
        >
            {cfg.icon}
            {cfg.label}
        </span>
    )
}

// ─── Schemas y Modales ────────────────────────────────────────────────────────

const quoteSchema = z.object({
    validUntil: z.string().min(1, 'La fecha es obligatoria'),
    notes: z.string().optional(),
})
type QuoteFormValues = z.infer<typeof quoteSchema>

function NewQuoteModal({
    patientId,
    onClose,
}: {
    patientId: string
    onClose: () => void
}) {
    const { mutate: create, isPending } = useCreateQuote()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<QuoteFormValues>({
        resolver: zodResolver(quoteSchema),
        defaultValues: { notes: '' },
    })

    const minDate = getTodayString()

    const onSubmit = (data: QuoteFormValues) => {
        create(
            {
                patientId,
                notes: data.notes || '',
                validUntil: data.validUntil,
                status: 'draft',
            },
            { onSuccess: onClose }
        )
    }

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-sm p-0 overflow-hidden">
                <DialogHeader className="px-5 py-4 border-b border-border">
                    <DialogTitle className="text-base font-bold text-foreground">
                        Nuevo Presupuesto
                    </DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col"
                >
                    <div className="p-5 flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Válido hasta{' '}
                                <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="date"
                                min={minDate}
                                {...register('validUntil')}
                                className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                            {errors.validUntil && (
                                <p className="text-[10px] text-destructive">
                                    {errors.validUntil.message}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Notas
                            </label>
                            <textarea
                                {...register('notes')}
                                rows={3}
                                placeholder="Observaciones del presupuesto…"
                                className="rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 px-5 pb-5">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 gap-2"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : null}
                            Crear
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

const paymentSchema = z.object({
    amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
    method: z.enum(['cash', 'card_credit', 'card_debit', 'transfer', 'check']),
    reference: z.string().optional(),
})
type PaymentFormValues = z.infer<typeof paymentSchema>

function NewPaymentModal({
    quoteId,
    remaining,
    onClose,
}: {
    quoteId: string
    remaining: number
    onClose: () => void
}) {
    const { mutate: create, isPending } = useCreatePayment(quoteId)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: remaining > 0 ? remaining : 0,
            method: 'cash',
            reference: '',
        },
    })

    const onSubmit = (data: PaymentFormValues) => {
        create(
            {
                amount: data.amount,
                method: data.method,
                reference: data.reference || '',
            },
            { onSuccess: onClose }
        )
    }

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-sm p-0 overflow-hidden">
                <DialogHeader className="px-5 py-4 border-b border-border">
                    <DialogTitle className="text-base font-bold text-foreground">
                        Registrar Pago
                    </DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col"
                >
                    <div className="p-5 flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Monto
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min={0.01}
                                {...register('amount', { valueAsNumber: true })}
                                className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                            {errors.amount && (
                                <p className="text-[10px] text-destructive">
                                    {errors.amount.message}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Método de pago
                            </label>
                            <select
                                {...register('method')}
                                className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                {(
                                    Object.keys(
                                        PAYMENT_METHOD_LABELS
                                    ) as PaymentMethod[]
                                ).map((m) => (
                                    <option key={m} value={m}>
                                        {PAYMENT_METHOD_LABELS[m]}
                                    </option>
                                ))}
                            </select>
                            {errors.method && (
                                <p className="text-[10px] text-destructive">
                                    {errors.method.message}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Referencia (opcional)
                            </label>
                            <input
                                type="text"
                                {...register('reference')}
                                placeholder="Número de transferencia, folio…"
                                className="h-9 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 px-5 pb-5">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 gap-2"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : null}
                            Registrar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ─── Sección de items de un presupuesto ───────────────────────────────────────
function QuoteItemsSection({
    quote,
    canEdit,
}: {
    quote: PatientQuote
    canEdit: boolean
}) {
    const { data: treatmentsData } = useTreatments({ isActive: true })
    const { data: itemsData, isLoading: itemsLoading } = useQuoteItems(quote.id)
    const { mutate: addItem, isPending: adding } = useCreateQuoteItem(quote.id)
    const { mutate: removeItem, isPending: removing } = useDeleteQuoteItem(
        quote.id
    )

    const [selectedTreatment, setSelectedTreatment] = useState('')
    const [toothNumber, setToothNumber] = useState('')
    const [discount, setDiscount] = useState('') // ← Cambio aquí para permitir el placeholder

    const treatments = treatmentsData?.data.data ?? []
    // const items: PatientItem[] = canEdit
    // ? itemsData?.data.data ?? []
    // : quote.items ?? []

    const patientItems: PatientItem[] = quote.items ?? []
    const items: QuoteItem[] = itemsData?.data.data ?? []

    const length = canEdit ? items.length : patientItems.length

    // Construye mapa treatmentId → Treatment para lookup rápido
    const treatmentMap = Object.fromEntries(treatments.map((t) => [t.id, t]))

    const getItemTreatments = (item: QuoteItem | PatientItem): Treatment => {
        if (!canEdit) {
            return (item as PatientItem).treatment
        }
        return treatmentMap[item.treatmentId]
    }

    function handleAdd() {
        if (!selectedTreatment) return
        addItem(
            {
                treatmentId: selectedTreatment,
                toothNumber: toothNumber ? parseInt(toothNumber) : 0,
                discount: (parseFloat(discount) || 0) / 100,
            },
            {
                onSuccess: () => {
                    setSelectedTreatment('')
                    setToothNumber('')
                    setDiscount('') // Restablecer al string vacío
                },
            }
        )
    }

    const isDraft = quote.status === 'draft'

    return (
        <div className="flex flex-col gap-3">
            {/* Agregar item — solo en borrador */}
            {isDraft && canEdit && (
                <div className="flex flex-wrap gap-2">
                    <select
                        value={selectedTreatment}
                        onChange={(e) => setSelectedTreatment(e.target.value)}
                        className="flex-1 min-w-45 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                        <option value="">Seleccionar tratamiento…</option>
                        {treatments.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name} — {formatMoney(t.unitPrice)}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        min={0}
                        placeholder="Diente FDI"
                        value={toothNumber}
                        onChange={(e) => setToothNumber(e.target.value)}
                        className="w-28 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Desc. %"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="w-24 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <Button
                        size="sm"
                        onClick={handleAdd}
                        disabled={adding || !selectedTreatment}
                        className="gap-1.5 shrink-0"
                    >
                        {adding ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Plus className="h-3.5 w-3.5" />
                        )}
                        Agregar
                    </Button>
                </div>
            )}

            {/* Tabla de items */}
            {itemsLoading ? (
                <div className="flex flex-col gap-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-10 rounded-lg bg-muted animate-pulse"
                        />
                    ))}
                </div>
            ) : length === 0 ? (
                <p className="text-sm text-muted-foreground py-2 text-center">
                    Sin tratamientos agregados
                </p>
            ) : (
                <div className="rounded-lg border border-border/50 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border/50 bg-muted/40">
                                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                                    Tratamiento
                                </th>
                                <th className="hidden sm:table-cell px-3 py-2 text-center text-xs font-semibold text-muted-foreground">
                                    Diente
                                </th>
                                <th className="hidden sm:table-cell px-3 py-2 text-center text-xs font-semibold text-muted-foreground">
                                    Desc.
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">
                                    Subtotal
                                </th>
                                {isDraft && <th className="w-8" />}
                            </tr>
                        </thead>
                        <tbody>
                            {(canEdit ? items : patientItems).map((item) => {
                                const t = getItemTreatments(item)
                                const subtotal = t
                                    ? t.unitPrice * (1 - item.discount)
                                    : 0
                                return (
                                    <tr
                                        key={item.id}
                                        className="border-b border-border/30 last:border-0"
                                    >
                                        <td className="px-3 py-2 text-xs text-foreground">
                                            {t?.name ?? '—'}
                                        </td>
                                        <td className="hidden sm:table-cell px-3 py-2 text-center text-xs text-muted-foreground">
                                            {item.toothNumber || '—'}
                                        </td>
                                        <td className="hidden sm:table-cell px-3 py-2 text-center text-xs text-muted-foreground">
                                            {item.discount > 0
                                                ? `${Math.round(item.discount * 100)}%`
                                                : '—'}
                                        </td>
                                        <td className="px-3 py-2 text-right text-xs font-semibold text-foreground">
                                            {formatMoney(subtotal)}
                                        </td>
                                        {isDraft && canEdit && (
                                            <td className="px-2 py-2">
                                                <button
                                                    onClick={() =>
                                                        removeItem(item.id)
                                                    }
                                                    disabled={removing}
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-border/50 bg-muted/20">
                                <td
                                    colSpan={isDraft ? 3 : 2}
                                    className="px-3 py-2 text-xs font-bold text-foreground"
                                >
                                    Total
                                </td>
                                <td className="px-3 py-2 text-right text-sm font-bold text-foreground">
                                    {formatMoney(quote.total)}
                                </td>
                                {isDraft && <td />}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    )
}

// ─── Sección de pagos de un presupuesto ───────────────────────────────────────
function QuotePaymentsSection({
    quote,
    canEdit,
}: {
    quote: PatientQuote
    canEdit: boolean
}) {
    const [showPayModal, setShowPayModal] = useState(false)
    const { data, isLoading } = useQuotePayments(quote.id)

    const payments: Payment[] = canEdit
        ? (data?.pages.flatMap((p) => p.data.data) ?? [])
        : (quote.Payments.flatMap((p) => p) ?? [])
    const totalPaid = payments
        .filter((p) => p.status === 'completed')
        .reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
    const remaining = quote.total - totalPaid

    const canPay = quote.status === 'accepted' && remaining > 0

    return (
        <div className="flex flex-col gap-3">
            {/* Resumen saldo */}
            <div className="grid grid-cols-3 gap-2">
                {[
                    {
                        label: 'Total',
                        value: formatMoney(quote.total),
                        className: 'text-foreground',
                    },
                    {
                        label: 'Pagado',
                        value: formatMoney(totalPaid),
                        className: 'text-emerald-600',
                    },
                    {
                        label: 'Pendiente',
                        value: formatMoney(remaining > 0 ? remaining : 0),
                        className:
                            remaining > 0
                                ? 'text-rose-600'
                                : 'text-emerald-600',
                    },
                ].map(({ label, value, className }) => (
                    <div
                        key={label}
                        className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5 flex flex-col gap-0.5"
                    >
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                            {label}
                        </span>
                        <span className={`text-sm font-bold ${className}`}>
                            {value}
                        </span>
                    </div>
                ))}
            </div>

            {/* Botón registrar pago */}
            {canPay && canEdit && (
                <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 w-fit"
                    onClick={() => setShowPayModal(true)}
                >
                    <BadgeDollarSign className="h-3.5 w-3.5" />
                    Registrar pago
                </Button>
            )}

            {/* Tabla de pagos */}
            {isLoading ? (
                <div className="h-16 rounded-lg bg-muted animate-pulse" />
            ) : payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                    Sin pagos registrados
                </p>
            ) : (
                <div className="rounded-lg border border-border/50 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border/50 bg-muted/40">
                                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                                    Método
                                </th>
                                <th className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                                    Referencia
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
                            {payments.map((p) => (
                                <tr
                                    key={p.id}
                                    className="border-b border-border/30 last:border-0"
                                >
                                    <td className="px-3 py-2 text-xs text-foreground">
                                        {PAYMENT_METHOD_LABELS[p.method]}
                                    </td>
                                    <td className="hidden sm:table-cell px-3 py-2 text-xs text-muted-foreground truncate max-w-30">
                                        {p.reference || '—'}
                                    </td>
                                    <td className="px-3 py-2 text-right text-xs font-semibold text-foreground">
                                        {formatMoney(p.amount)}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <PaymentStatusBadge status={p.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showPayModal && (
                <NewPaymentModal
                    quoteId={quote.id}
                    remaining={remaining}
                    onClose={() => setShowPayModal(false)}
                />
            )}
        </div>
    )
}

// ─── Tarjeta de presupuesto expandible ────────────────────────────────────────
function QuoteCard({
    quote,
    canEdit,
}: {
    quote: PatientQuote
    canEdit: boolean
}) {
    const [expanded, setExpanded] = useState(false)
    const [activeTab, setActiveTab] = useState<'items' | 'payments'>('items')
    const { mutate: patchQuote } = usePatchQuote()
    const { mutate: deleteQuote } = useDeleteQuote()
    const { mutate: generatePdf, isPending: generatingPdf } =
        useGenerateQuotePdf()
    const isDraft = quote.status === 'draft'

    return (
        <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
            {/* Header de la tarjeta */}
            <div
                className="flex items-start sm:items-center justify-between px-4 py-3.5 gap-2 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpanded((e) => !e)}
            >
                {/* Bloque Izquierdo: Icono e Info */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                    {/* Margen superior en móviles para alinearlo con la primera línea de texto */}
                    <ReceiptText className="h-4 w-4 mt-0.5 sm:mt-0 text-muted-foreground shrink-0" />

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground truncate">
                                Presupuesto #{quote.id.slice(-6).toUpperCase()}
                            </span>
                            <QuoteStatusBadge status={quote.status} />
                        </div>

                        {/* Dividimos la fecha y el total en móviles para evitar que el texto se rompa feo */}
                        <div className="mt-0.5 flex flex-col sm:flex-row sm:items-center text-xs text-muted-foreground sm:gap-1.5">
                            <span className="truncate">
                                Válido hasta {formatDate(quote.validUntil)}
                            </span>
                            <span className="hidden sm:inline">·</span>
                            <span className="font-medium text-foreground sm:text-muted-foreground">
                                Total: {formatMoney(quote.total)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bloque Derecho: Botones y Chevron */}
                <div className="flex items-center gap-1 shrink-0 ml-auto">
                    {canEdit && (
                        <div className="flex items-center gap-1">
                            {isDraft && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        patchQuote({
                                            id: quote.id,
                                            dto: { status: 'sent' },
                                        })
                                    }}
                                    className="hidden sm:flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                    Marcar enviado
                                </button>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        disabled={generatingPdf}
                                        className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                                        title="Exportar PDF"
                                    >
                                        {generatingPdf ? (
                                            <Loader2 className="h-4 w-4 sm:h-3.5 sm:w-3.5 animate-spin" />
                                        ) : (
                                            <FileDown className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                                        )}
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 sm:w-48"
                                >
                                    <DropdownMenuItem
                                        className="gap-2 cursor-pointer text-sm sm:text-xs py-2 sm:py-1.5"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            generatePdf({
                                                quoteId: quote.id,
                                                createPatientFile: false,
                                            })
                                        }}
                                    >
                                        <FileDown className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                                        Solo descargar PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="gap-2 cursor-pointer text-sm sm:text-xs py-2 sm:py-1.5"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            generatePdf({
                                                quoteId: quote.id,
                                                createPatientFile: true,
                                            })
                                        }}
                                    >
                                        <FileDown className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                                        Descargar y guardar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {isDraft && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (
                                            confirm(
                                                '¿Eliminar este presupuesto?'
                                            )
                                        )
                                            deleteQuote(quote.id)
                                    }}
                                    className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                                </button>
                            )}
                        </div>
                    )}
                    {/* Chevron */}
                    <div className="ml-1 flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-md hover:bg-muted/50 transition-colors">
                        {expanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                    </div>
                </div>
            </div>

            {/* Contenido expandible */}
            {expanded && (
                <div className="border-t border-border/40 px-4 pb-4 pt-3 flex flex-col gap-4 bg-muted/10">
                    {/* Notas */}
                    {quote.notes && (
                        <p className="text-xs text-muted-foreground italic bg-background p-2 rounded-md border border-border/50">
                            "{quote.notes}"
                        </p>
                    )}

                    {/* Mini tabs: Expanden al 100% en móviles (w-full) y se ajustan (w-fit) en escritorio */}
                    <div className="flex w-full sm:w-fit gap-1 rounded-lg border border-border/50 bg-muted/30 p-1">
                        {(['items', 'payments'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setActiveTab(t)}
                                className={`flex-1 sm:flex-none rounded-md px-3 py-1.5 text-xs font-medium transition-all
              ${
                  activeTab === t
                      ? 'bg-card shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
                            >
                                {t === 'items' ? 'Tratamientos' : 'Pagos'}
                            </button>
                        ))}
                    </div>

                    {/* Contenido Tab */}
                    <div className="overflow-x-auto">
                        {activeTab === 'items' ? (
                            <QuoteItemsSection
                                quote={quote}
                                canEdit={canEdit}
                            />
                        ) : (
                            <QuotePaymentsSection
                                quote={quote}
                                canEdit={canEdit}
                            />
                        )}
                    </div>

                    {/* Cambio de estado para aceptar/rechazar: Columnas en móviles, fila en escritorio */}
                    {quote.status === 'sent' && (
                        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-border/40">
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-10 sm:h-9"
                                onClick={() =>
                                    patchQuote({
                                        id: quote.id,
                                        dto: { status: 'accepted' },
                                    })
                                }
                            >
                                <CheckCircle2 className="h-4 w-4" /> Aceptar
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50 h-10 sm:h-9"
                                onClick={() =>
                                    patchQuote({
                                        id: quote.id,
                                        dto: { status: 'rejected' },
                                    })
                                }
                            >
                                <XCircle className="h-4 w-4" /> Rechazar
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Tab principal ────────────────────────────────────────────────────────────
export function TabPresupuestos({ patientId }: { patientId: string }) {
    const [showNewModal, setShowNewModal] = useState(false)

    const user = useAuthStore((s) => s.user)
    const canEdit = user?.role === 'dentist' || user?.role === 'admin'

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useQuotesByPatient(patientId)

    const loaderRef = useRef<HTMLDivElement>(null)
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

    const quotes: PatientQuote[] = data?.pages.flatMap((p) => p.data.data) ?? []

    return (
        <div className="flex flex-col gap-4 w-full min-w-0">
            {/* Toolbar */}
            {/* Agregamos flex-wrap y gap-3 por si en un celular muy pequeño no caben en una línea */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    {isLoading
                        ? 'Cargando…'
                        : `${quotes.length} presupuesto${quotes.length !== 1 ? 's' : ''}`}
                </p>
                {canEdit && (
                    <Button
                        size="sm"
                        className="gap-1.5 shrink-0"
                        onClick={() => setShowNewModal(true)}
                    >
                        <Plus className="h-3.5 w-3.5 shrink-0" />
                        {/* En móviles dice "Nuevo", en PC dice "Nuevo Presupuesto" para ahorrar espacio */}
                        <span className="sm:hidden">Nuevo</span>
                        <span className="hidden sm:inline">
                            Nuevo Presupuesto
                        </span>
                    </Button>
                )}
            </div>

            {/* Lista */}
            {isLoading ? (
                <div className="flex flex-col gap-3 w-full min-w-0">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-16 rounded-xl bg-muted animate-pulse w-full"
                        />
                    ))}
                </div>
            ) : quotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2 border border-dashed border-border/50 rounded-xl w-full">
                    <CreditCard className="h-10 w-10 opacity-20 shrink-0" />
                    <p className="text-sm text-center px-4">
                        Sin presupuestos registrados
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 w-full min-w-0">
                    {quotes.map((q) => (
                        // min-w-0 aquí es CRUCIAL para que la tarjeta no fuerce el ancho hacia afuera
                        <div key={q.id} className="min-w-0 w-full">
                            <QuoteCard quote={q} canEdit={canEdit} />
                        </div>
                    ))}
                </div>
            )}

            {/* Scroll infinito */}
            <div ref={loaderRef} className="flex justify-center py-2">
                {isFetchingNextPage && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
            </div>

            {/* Modal nuevo presupuesto */}
            {showNewModal && (
                <NewQuoteModal
                    patientId={patientId}
                    onClose={() => setShowNewModal(false)}
                />
            )}
        </div>
    )
}
